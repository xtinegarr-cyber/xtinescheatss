// Base URL for the API server.
// In Replit dev: both store and API are proxied on the same domain — /api works as a relative path.
// On Railway: set VITE_API_URL to your API server's full URL (e.g. https://xtinecheats-api.railway.app).
export const API_BASE = 'https://workspaceapi-server-production-5721.up.railway.app';

export type StripeLineItem = {
  name: string;
  duration: string;
  price: number;
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
