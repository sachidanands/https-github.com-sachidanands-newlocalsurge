import type { IncomingHttpHeaders } from "http";

export interface PaypalConfig {
  clientId: string;
  clientSecret: string;
  planId: string;
  webhookId: string;
  apiBase: string;
  env: "sandbox" | "live";
}

export function getPaypalConfig(): PaypalConfig {
  const env: "sandbox" | "live" = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  const defaultBase = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const apiBase = (process.env.PAYPAL_API_BASE || defaultBase).replace(/\/+$/, "");

  return {
    clientId: (process.env.PAYPAL_CLIENT_ID || "").trim(),
    clientSecret: (process.env.PAYPAL_CLIENT_SECRET || "").trim(),
    planId: (process.env.PAYPAL_PLAN_ID || "").trim(),
    webhookId: (process.env.PAYPAL_WEBHOOK_ID || "").trim(),
    apiBase,
    env
  };
}

export function billingConfigured(): boolean {
  const cfg = getPaypalConfig();
  return Boolean(cfg.clientId && cfg.clientSecret && cfg.planId);
}

let cachedToken: { token: string; expiresAt: number; cacheKey: string } | null = null;

export async function getPaypalAccessToken(): Promise<string> {
  const cfg = getPaypalConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const cacheKey = `${cfg.apiBase}:${cfg.clientId}`;
  if (cachedToken && cachedToken.cacheKey === cacheKey && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`, "utf8").toString("base64");
  const resp = await fetch(`${cfg.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(10000)
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`PayPal OAuth failed (${resp.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("PayPal OAuth response missing access_token.");
  }

  const ttlMs = Math.max(60, Number(data.expires_in || 300) - 60) * 1000;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + ttlMs,
    cacheKey
  };
  return data.access_token;
}

export async function createPaypalSubscription(params: {
  siteId: string;
  subscriberEmail?: string;
  subscriberName?: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ subscriptionId: string; approveUrl: string; status: string }> {
  const cfg = getPaypalConfig();
  if (!cfg.planId) {
    throw new Error("PAYPAL_PLAN_ID is not configured.");
  }

  const accessToken = await getPaypalAccessToken();
  const payload: Record<string, any> = {
    plan_id: cfg.planId,
    custom_id: params.siteId,
    application_context: {
      brand_name: "LocalSurge AI FrontDesk",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl
    }
  };

  if (params.subscriberEmail) {
    payload.subscriber = {
      email_address: params.subscriberEmail,
      ...(params.subscriberName ? { name: { given_name: params.subscriberName.slice(0, 80) } } : {})
    };
  }

  const resp = await fetch(`${cfg.apiBase}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000)
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`PayPal create subscription failed (${resp.status}): ${errText.slice(0, 250)}`);
  }

  const data = (await resp.json()) as {
    id?: string;
    status?: string;
    links?: Array<{ rel?: string; href?: string }>;
  };

  const approveLink = (data.links || []).find((l) => l.rel === "approve")?.href || "";
  if (!data.id || !approveLink) {
    throw new Error("PayPal subscription response missing subscription id or approval link.");
  }

  return {
    subscriptionId: data.id,
    approveUrl: approveLink,
    status: data.status || "APPROVAL_PENDING"
  };
}

export interface PaypalSubscriptionDetails {
  id: string;
  status: string;
  customId?: string;
  planId?: string;
  nextBillingTime?: string | null;
  subscriberEmail?: string | null;
}

export async function getPaypalSubscription(subscriptionId: string): Promise<PaypalSubscriptionDetails> {
  const cfg = getPaypalConfig();
  const accessToken = await getPaypalAccessToken();

  const resp = await fetch(`${cfg.apiBase}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`PayPal subscription lookup failed (${resp.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as any;
  return {
    id: data.id || subscriptionId,
    status: String(data.status || "UNKNOWN").toUpperCase(),
    customId: data.custom_id ? String(data.custom_id) : undefined,
    planId: data.plan_id ? String(data.plan_id) : undefined,
    nextBillingTime: data.billing_info?.next_billing_time || null,
    subscriberEmail: data.subscriber?.email_address || null
  };
}

export async function cancelPaypalSubscription(subscriptionId: string, reason = "Customer requested cancellation via AI FrontDesk dashboard"): Promise<void> {
  const cfg = getPaypalConfig();
  const accessToken = await getPaypalAccessToken();

  const resp = await fetch(`${cfg.apiBase}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ reason: reason.slice(0, 128) }),
    signal: AbortSignal.timeout(10000)
  });

  if (!resp.ok && resp.status !== 204) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`PayPal cancel subscription failed (${resp.status}): ${errText.slice(0, 200)}`);
  }
}

export async function verifyPaypalWebhookSignature(
  headers: IncomingHttpHeaders,
  webhookEvent: unknown
): Promise<boolean> {
  const cfg = getPaypalConfig();
  if (!cfg.webhookId || !cfg.clientId || !cfg.clientSecret) {
    return false;
  }

  const transmissionId = String(headers["paypal-transmission-id"] || "");
  const transmissionTime = String(headers["paypal-transmission-time"] || "");
  const certUrl = String(headers["paypal-cert-url"] || "");
  const authAlgo = String(headers["paypal-auth-algo"] || "");
  const transmissionSig = String(headers["paypal-transmission-sig"] || "");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  try {
    const accessToken = await getPaypalAccessToken();
    const resp = await fetch(`${cfg.apiBase}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: cfg.webhookId,
        webhook_event: webhookEvent
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!resp.ok) return false;
    const data = (await resp.json()) as { verification_status?: string };
    return data.verification_status === "SUCCESS";
  } catch (err) {
    console.warn("⚠️ PayPal webhook verification error:", err);
    return false;
  }
}

export async function createPaypalProductAndPlan(options?: {
  productName?: string;
  planName?: string;
  priceUsd?: string;
}): Promise<{ productId: string; planId: string }> {
  const cfg = getPaypalConfig();
  const accessToken = await getPaypalAccessToken();
  const productName = options?.productName || "AI FrontDesk Chatbot";
  const planName = options?.planName || "AI FrontDesk Monthly";
  const priceUsd = options?.priceUsd || "5.00";

  const productResp = await fetch(`${cfg.apiBase}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: productName,
      description: "24/7 website chatbot trained on your business site with lead capture and instant delivery.",
      type: "SERVICE",
      category: "SOFTWARE"
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!productResp.ok) {
    const errText = await productResp.text().catch(() => "");
    throw new Error(`PayPal product creation failed (${productResp.status}): ${errText}`);
  }
  const productData = (await productResp.json()) as { id: string };

  const planResp = await fetch(`${cfg.apiBase}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      product_id: productData.id,
      name: planName,
      description: `$${priceUsd}/month recurring subscription for AI FrontDesk website chatbot`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: priceUsd, currency_code: "USD" }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: "0", currency_code: "USD" },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      }
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!planResp.ok) {
    const errText = await planResp.text().catch(() => "");
    throw new Error(`PayPal plan creation failed (${planResp.status}): ${errText}`);
  }
  const planData = (await planResp.json()) as { id: string };
  return { productId: productData.id, planId: planData.id };
}
