// Base URL for the API server.
// In Replit dev: both store and API are proxied on the same domain — /api works as a relative path.
// On Railway: set VITE_API_URL to your API server's full URL (e.g. https://xtinecheats-api.railway.app).
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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

  const successUrl = `${origin}${base}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}${base}/`;

  const res = await fetch(`${API_BASE}/api/checkout/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, successUrl, cancelUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((err as { error?: string }).error ?? 'Checkout failed');
  }

  return res.json() as Promise<{ url: string }>;
}
