import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Execution = {
  id: string;
  workspace_id: string;
  action_type: string;
  provider: string;
  parameters: Record<string, unknown>;
  attempt_count: number;
  status: string;
  authorized_by: string | null;
  human_review_id: string | null;
};

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});
const str = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const retryAt = (attempt: number) => new Date(Date.now() + Math.min(3600, 15 * 2 ** Math.max(0, attempt - 1)) * 1000).toISOString();

function clients() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("SERVER_NOT_CONFIGURED");
  return { admin: createClient(url, serviceKey, { auth: { persistSession: false } }) };
}

async function authorizeExecution(admin: ReturnType<typeof createClient>, token: string, id: string): Promise<Execution> {
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) throw new Error("UNAUTHORIZED");

  const { data: execution, error: executionError } = await admin.from("action_executions")
    .select("id,workspace_id,action_type,provider,parameters,attempt_count,status,authorized_by,human_review_id")
    .eq("id", id).maybeSingle();
  if (executionError) throw new Error("AUTHORIZATION_LOOKUP_FAILED");
  if (!execution) throw new Error("ACTION_NOT_FOUND");
  if (!["authorized", "queued", "retryable"].includes(execution.status)) throw new Error("ACTION_NOT_CLAIMABLE");

  // Only an explicitly authorized action may run, and the caller must be an
  // owner/admin of the action's own workspace. The service role is used only
  // after this caller and tenant check has succeeded.
  if (!execution.authorized_by) throw new Error("FORBIDDEN");
  const { data: membership, error: membershipError } = await admin.from("workspace_members")
    .select("role").eq("workspace_id", execution.workspace_id).eq("user_id", user.id).maybeSingle();
  if (membershipError) throw new Error("AUTHORIZATION_LOOKUP_FAILED");
  if (!membership || !["owner", "admin"].includes(membership.role)) throw new Error("FORBIDDEN");

  if (execution.human_review_id) {
    const { data: review, error: reviewError } = await admin.from("human_reviews")
      .select("status,workspace_id").eq("id", execution.human_review_id).maybeSingle();
    if (reviewError) throw new Error("AUTHORIZATION_LOOKUP_FAILED");
    if (!review || review.workspace_id !== execution.workspace_id || review.status !== "approved") throw new Error("HUMAN_APPROVAL_REQUIRED");
  }
  return execution as Execution;
}

async function googleToken() {
  const id = Deno.env.get("GOOGLE_CLIENT_ID");
  const secret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refresh = Deno.env.get("GOOGLE_REFRESH_TOKEN");
  if (!id || !secret || !refresh) throw new Error("GOOGLE_NOT_CONFIGURED");
  const result = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: "refresh_token" }),
  });
  if (!result.ok) throw new Error(result.status === 400 || result.status === 401 ? "GOOGLE_AUTH_FAILED" : "GOOGLE_UNAVAILABLE");
  const payload = await result.json();
  if (typeof payload.access_token !== "string") throw new Error("GOOGLE_UNAVAILABLE");
  return payload.access_token as string;
}

async function google(path: string, init: RequestInit = {}) {
  const token = await googleToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
      ...init,
      signal: controller.signal,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
    });
    if (!result.ok) throw new Error(result.status === 401 || result.status === 403 ? "GOOGLE_AUTH_FAILED" : result.status === 429 ? "GOOGLE_RATE_LIMITED" : "GOOGLE_UNAVAILABLE");
    return result;
  } finally {
    clearTimeout(timer);
  }
}

async function run(admin: ReturnType<typeof createClient>, row: Execution) {
  const { data: execution, error } = await admin.rpc("claim_action_execution", { target_id: row.id });
  if (error || !execution) throw new Error(error?.message || "ACTION_NOT_CLAIMABLE");
  const claimed = execution as Execution;
  try {
    if (claimed.provider !== "google-calendar" || !["calendar.create", "calendar.create_booking", "create_calendar_booking"].includes(claimed.action_type)) {
      const { data, error: persistError } = await admin.rpc("fail_action_execution", {
        target_id: row.id, target_status: "failed", target_error_code: "UNSUPPORTED_ACTION",
        target_error_message: "No executor is registered for this action type and provider.",
        target_retry_at: null, target_provider_reference: null,
      });
      if (persistError) throw new Error("EXECUTION_PERSISTENCE_FAILED");
      return data;
    }

    const parameters = claimed.parameters;
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
    const start = str(parameters.start ?? parameters.startDateTime, 80);
    const end = str(parameters.end ?? parameters.endDateTime, 80);
    const timezone = str(parameters.timezone, 100);
    if (!calendarId) throw new Error("GOOGLE_NOT_CONFIGURED");
    if (!start || !end || !timezone) throw new Error("INVALID_ACTION_PARAMETERS");

    const event = {
      summary: str(parameters.title, 200) || "Quincestone appointment",
      description: str(parameters.description, 2000) || undefined,
      start: { dateTime: start, timeZone: timezone },
      end: { dateTime: end, timeZone: timezone },
      conferenceData: { createRequest: { requestId: claimed.id, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    };
    const result = await google(`/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=none`, {
      method: "POST", body: JSON.stringify(event),
    });
    const created = await result.json();
    if (!created?.id) throw new Error("GOOGLE_UNAVAILABLE");
    const outcome = {
      calendarEventId: String(created.id),
      meetingUrl: created.hangoutLink ?? created.conferenceData?.entryPoints?.find((item: { entryPointType: string }) => item.entryPointType === "video")?.uri ?? null,
    };
    const { data, error: completeError } = await admin.rpc("complete_action_execution", {
      target_id: row.id, target_provider_reference: String(created.id), target_result: outcome,
    });
    if (completeError) throw new Error("EXECUTION_PERSISTENCE_FAILED");
    return data;
  } catch (error) {
    const code = error instanceof Error ? error.message : "EXECUTION_FAILED";
    const retryable = ["GOOGLE_UNAVAILABLE", "GOOGLE_RATE_LIMITED", "GOOGLE_AUTH_FAILED"].includes(code);
    const status = code === "GOOGLE_UNAVAILABLE" ? "unknown" : retryable ? "retryable" : "failed";
    const { data, error: persistError } = await admin.rpc("fail_action_execution", {
      target_id: row.id, target_status: status, target_error_code: code.slice(0, 128),
      target_error_message: retryable ? "Provider execution did not complete; reconciliation is required before another attempt." : "Action execution failed.",
      target_retry_at: retryable ? retryAt(claimed.attempt_count) : null, target_provider_reference: null,
    });
    if (persistError) throw new Error("EXECUTION_PERSISTENCE_FAILED");
    return data;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return response({ success: false, error: "Method not allowed" }, 405);
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return response({ success: false, error: "Request too large." }, 413);
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token || token === authorization) return response({ success: false, error: "Authentication required." }, 401);
  let body: Record<string, unknown>;
  try {
    const value = await req.json();
    body = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch {
    return response({ success: false, error: "Invalid JSON body." }, 400);
  }
  const id = str(body.actionExecutionId, 80);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response({ success: false, error: "Valid actionExecutionId is required." }, 400);
  try {
    const { admin } = clients();
    const authorized = await authorizeExecution(admin, token, id);
    return response({ success: true, execution: await run(admin, authorized) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "EXECUTION_FAILED";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" || code === "HUMAN_APPROVAL_REQUIRED" ? 403 :
      code === "ACTION_NOT_FOUND" ? 404 : code === "ACTION_NOT_CLAIMABLE" ? 409 : 500;
    return response({ success: false, error: status === 500 ? "Execution could not be completed." : code }, status);
  }
});
