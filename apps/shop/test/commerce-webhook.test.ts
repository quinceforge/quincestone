import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpcMock, createClientMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

import handler from "../api/commerce-webhook";

const secret = "whsec_test_secret";
const event = {
  id: "evt_test_123",
  type: "checkout.session.completed",
  created: 1795000000,
  data: { object: { id: "cs_test_123", payment_status: "paid", metadata: { order_id: "11111111-1111-4111-8111-111111111111" } } },
};

function request(payload: string, method = "POST", validSignature = true) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return Object.assign(Readable.from([Buffer.from(payload)]), {
    method,
    headers: {
      "stripe-signature": validSignature ? `t=${timestamp},v1=${signature}` : `t=${timestamp},v1=invalid`,
    },
  });
}

function response() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(value: unknown) { this.body = value; return value; },
  };
}

describe("Stripe commerce webhook boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
    rpcMock.mockResolvedValue({ data: { received: true, reconciled: true }, error: null });
    createClientMock.mockReturnValue({ rpc: rpcMock });
  });

  it("rejects non-POST requests without calling Supabase", async () => {
    const res = response();
    await handler(request(JSON.stringify(event), "GET") as never, res as never);
    expect(res.statusCode).toBe(405);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rejects invalid signatures before calling Supabase", async () => {
    const payload = JSON.stringify(event);
    const res = response();
    await handler(request(payload, "POST", false) as never, res as never);
    expect(res.statusCode).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("delegates a verified event to the atomic database transaction", async () => {
    const payload = JSON.stringify(event);
    const res = response();
    await handler(request(payload) as never, res as never);
    expect(createClientMock).toHaveBeenCalledWith("https://project.supabase.co", "service-role-test-key", {
      auth: { persistSession: false },
    });
    expect(rpcMock).toHaveBeenCalledWith("process_stripe_webhook_event", { p_event: event });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true });
  });

  it("returns success for an event already claimed by another delivery", async () => {
    rpcMock.mockResolvedValue({ data: { received: true, duplicate: true }, error: null });
    const res = response();
    await handler(request(JSON.stringify(event)) as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: true, duplicate: true });
  });

  it("returns a retryable server response when the transaction fails", async () => {
    rpcMock.mockResolvedValue({ data: null, error: new Error("transaction rolled back") });
    const res = response();
    await handler(request(JSON.stringify(event)) as never, res as never);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Webhook reconciliation failed; Stripe may safely retry this event." });
  });

  it("rejects malformed event JSON", async () => {
    const res = response();
    await handler(request("{not-json") as never, res as never);
    expect(res.statusCode).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
