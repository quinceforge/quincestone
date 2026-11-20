import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

type StripeEvent = { id: string; type: string; created: number; data: { object: any } };

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
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload.toString("utf8")}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "hex");
    return candidate.length === expectedBuffer.length && timingSafeEqual(candidate, expectedBuffer);
  });
}

function eventTime(event: StripeEvent): string | null {
  return Number.isSafeInteger(event.created) && event.created > 0 ? new Date(event.created * 1000).toISOString() : null;
}

function isDbError(error: unknown): boolean {
  return Boolean(error);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const signature = req.headers?.["stripe-signature"];
  if (!secret || !supabaseUrl || !serviceKey) return res.status(503).json({ error: "Commerce webhook is not configured." });
  if (typeof signature !== "string") return res.status(400).json({ error: "Missing Stripe signature." });
  const payload = await rawBody(req);
  if (!verifyStripeSignature(payload, signature, secret)) return res.status(400).json({ error: "Invalid Stripe signature." });

  try {
    const event = JSON.parse(payload.toString("utf8")) as StripeEvent;
    if (!event?.id || !event?.type || !event?.data?.object) return res.status(400).json({ error: "Invalid Stripe event payload." });
    const occurredAt = eventTime(event);
    if (!occurredAt) return res.status(400).json({ error: "Stripe event timestamp is invalid." });
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // The durable event ledger is written only after reconciliation succeeds. If any
    // write fails, Stripe receives a retryable 500 and the event remains replayable.
    const { data: priorEvent, error: lookupError } = await supabase
      .from("commerce_stripe_events").select("event_id").eq("event_id", event.id).maybeSingle();
    if (isDbError(lookupError)) throw lookupError;
    if (priorEvent) return res.status(200).json({ received: true, duplicate: true });

    const object = event.data.object;
    if (event.type === "checkout.session.completed") {
      const orderId = typeof object.metadata?.order_id === "string" ? object.metadata.order_id : object.client_reference_id;
      if (!orderId || object.payment_status !== "paid") {
        const { error } = await supabase.from("commerce_stripe_events").insert({ event_id: event.id, event_type: event.type, event_created_at: occurredAt });
        if (error && error.code !== "23505") throw error;
        return res.status(200).json({ received: true, reconciled: false });
      }
      const { data: payment, error: paymentLookupError } = await supabase
        .from("commerce_payments").select("id,status").eq("provider_checkout_session_id", object.id).eq("order_id", orderId).maybeSingle();
      if (isDbError(paymentLookupError)) throw paymentLookupError;
      if (!payment) return res.status(409).json({ error: "Payment record not found." });

      const { data: updatedPayment, error: paymentUpdateError } = await supabase
        .from("commerce_payments")
        .update({
          provider_event_id: event.id,
          provider_event_created_at: occurredAt,
          provider_payment_intent_id: typeof object.payment_intent === "string" ? object.payment_intent : null,
          verified: true,
          status: "succeeded",
        })
        .eq("id", payment.id)
        .or(`provider_event_created_at.is.null,provider_event_created_at.lte.${occurredAt}`)
        .neq("status", "refunded")
        .neq("status", "partially_refunded")
        .select("id");
      if (isDbError(paymentUpdateError)) throw paymentUpdateError;

      // Do not reopen cancelled/refunded orders, even if an older checkout event arrives late.
      if (updatedPayment?.length) {
        const { error: orderError } = await supabase.from("commerce_orders")
          .update({ status: "fulfillment_required", paid_at: occurredAt })
          .eq("id", orderId).in("status", ["pending_payment", "paid"]);
        if (isDbError(orderError)) throw orderError;
        const { data: fulfillment, error: fulfillmentLookupError } = await supabase
          .from("commerce_fulfillments").select("id").eq("order_id", orderId).maybeSingle();
        if (isDbError(fulfillmentLookupError)) throw fulfillmentLookupError;
        if (!fulfillment) {
          const { error: fulfillmentInsertError } = await supabase.from("commerce_fulfillments")
            .insert({ order_id: orderId, source: "supplier", status: "required" });
          if (isDbError(fulfillmentInsertError)) throw fulfillmentInsertError;
        }
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const { data: payment, error: paymentLookupError } = await supabase
        .from("commerce_payments").select("id,order_id").eq("provider_payment_intent_id", object.id).maybeSingle();
      if (isDbError(paymentLookupError)) throw paymentLookupError;
      if (payment) {
        const { error: paymentUpdateError } = await supabase.from("commerce_payments")
          .update({ provider_event_id: event.id, provider_event_created_at: occurredAt, verified: true, status: "failed" })
          .eq("id", payment.id).or(`provider_event_created_at.is.null,provider_event_created_at.lte.${occurredAt}`)
          .in("status", ["pending", "processing"]);
        if (isDbError(paymentUpdateError)) throw paymentUpdateError;
        const { error: orderError } = await supabase.from("commerce_orders")
          .update({ status: "cancelled", cancelled_at: occurredAt })
          .eq("id", payment.order_id).eq("status", "pending_payment");
        if (isDbError(orderError)) throw orderError;
      }
    } else if (event.type === "charge.refunded") {
      const paymentIntent = typeof object.payment_intent === "string" ? object.payment_intent : null;
      if (paymentIntent) {
        const { data: payment, error: paymentLookupError } = await supabase
          .from("commerce_payments").select("id,order_id,currency").eq("provider_payment_intent_id", paymentIntent).maybeSingle();
        if (isDbError(paymentLookupError)) throw paymentLookupError;
        if (payment) {
          const amount = Number(object.amount_refunded || 0);
          const fullRefund = amount >= Number(object.amount || 0);
          const { data: updatedPayment, error: paymentUpdateError } = await supabase.from("commerce_payments")
            .update({ provider_event_id: event.id, provider_event_created_at: occurredAt, status: fullRefund ? "refunded" : "partially_refunded", verified: true })
            .eq("id", payment.id).or(`provider_event_created_at.is.null,provider_event_created_at.lte.${occurredAt}`)
            .neq("status", "refunded").select("id");
          if (isDbError(paymentUpdateError)) throw paymentUpdateError;
          if (updatedPayment?.length) {
            const { data: refund, error: refundLookupError } = await supabase.from("commerce_refunds")
              .select("id").eq("provider_refund_id", event.id).maybeSingle();
            if (isDbError(refundLookupError)) throw refundLookupError;
            if (!refund) {
              const { error: refundInsertError } = await supabase.from("commerce_refunds").insert({
                order_id: payment.order_id, payment_id: payment.id, provider: "stripe",
                provider_refund_id: event.id, amount, currency: payment.currency, status: "succeeded",
              });
              if (isDbError(refundInsertError) && refundInsertError.code !== "23505") throw refundInsertError;
            }
            if (fullRefund) {
              const { error: orderError } = await supabase.from("commerce_orders").update({ status: "refunded" })
                .eq("id", payment.order_id).not("status", "in", "(fulfilled,delivered,returned)");
              if (isDbError(orderError)) throw orderError;
            }
          }
        }
      }
    }

    const { error: ledgerError } = await supabase.from("commerce_stripe_events").insert({
      event_id: event.id, event_type: event.type, event_created_at: occurredAt,
    });
    if (ledgerError && ledgerError.code !== "23505") throw ledgerError;
    return res.status(200).json({ received: true, reconciled: true });
  } catch {
    return res.status(500).json({ error: "Webhook reconciliation failed; Stripe may safely retry this event." });
  }
}
