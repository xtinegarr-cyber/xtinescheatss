// The deployed API artifact is mounted at /api. VITE_API_URL remains available
// for an intentionally separate API deployment.
const configuredApiUrl = import.meta.env.VITE_API_URL
  ?.trim()
  .split(/\s+/)[0]
  .replace(/\/$/, '');

// Empty = this same site (the server that serves the store also runs the API).
export const API_BASE = configuredApiUrl || '';

export type StripeLineItem = {
  productId: string;
  durationIndex?: number;
  optionIndex?: number;
  qty: number;
};

export async function createStripeCheckoutSession(
  items: StripeLineItem[],
): Promise<{ url: string }> {
  const origin = window.location.origin;
  const base = window.location.pathname.replace(/\/$/, '');

  const successUrl = `${origin}${base}/order-complete?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}${base}/`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/checkout/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, successUrl, cancelUrl }),
    });
  } catch {
    throw new Error('Could not reach the payment server. Check your internet connection and try again.');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `Payment server error (HTTP ${res.status}). Make sure STRIPE_SECRET_KEY is set on the server.`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch { /* body wasn't JSON — keep the status message */ }
    throw new Error(message);
  }

  const data = await res.json() as { url?: string | null };
  if (!data.url) {
    throw new Error('Stripe did not return a checkout URL. Verify your Stripe keys are valid live-mode keys.');
  }
  return { url: data.url };
}
