import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
};

async function rawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload: Buffer, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload.toString("utf8")}`)
    .digest();
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

function isStripeEvent(value: unknown): value is StripeEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  const data = event.data;
  return typeof event.id === "string"
    && event.id.length > 0
    && typeof event.type === "string"
    && event.type.length > 0
    && Number.isSafeInteger(event.created)
    && (event.created as number) > 0
    && !!data
    && typeof data === "object"
    && !Array.isArray(data)
    && !!(data as Record<string, unknown>).object
    && typeof (data as Record<string, unknown>).object === "object";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const signature = req.headers?.["stripe-signature"];

  if (!secret || !supabaseUrl || !serviceKey) {
    return res.status(503).json({ error: "Commerce webhook is not configured." });
  }
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature." });
  }

  const payload = await rawBody(req);
  if (!verifyStripeSignature(payload, signature, secret)) {
    return res.status(400).json({ error: "Invalid Stripe signature." });
  }

  let event: unknown;
  try {
    event = JSON.parse(payload.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid Stripe event payload." });
  }
  if (!isStripeEvent(event)) {
    return res.status(400).json({ error: "Invalid Stripe event payload." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // The database function claims the unique event ID and performs every related
    // commerce write in one PostgreSQL transaction. Concurrent replays serialize
    // on the event primary key; failed transactions leave the event retryable.
    const { data, error } = await supabase.rpc("process_stripe_webhook_event", {
      p_event: event,
    });
    if (error) throw error;

    const result = data && typeof data === "object" ? data as Record<string, unknown> : {};
    return res.status(200).json({
      received: true,
      ...(result.duplicate === true ? { duplicate: true } : {}),
      ...(result.reconciled === false ? { reconciled: false } : {}),
    });
  } catch {
    // Return a retryable response. The database transaction rolls back its event
    // claim together with payment/order/fulfillment/refund writes on any failure.
    return res.status(500).json({ error: "Webhook reconciliation failed; Stripe may safely retry this event." });
  }
}
