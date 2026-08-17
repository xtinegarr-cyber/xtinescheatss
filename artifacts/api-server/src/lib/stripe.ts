import Stripe from 'stripe';

// Lazy singleton — only throws when actually used, not on server boot.
// This lets the API server start even if STRIPE_SECRET_KEY isn't set yet,
// so health checks and the products endpoint work while Stripe is unconfigured.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. ' +
      'Add it in your Railway service → Variables.'
    );
  }
  _stripe = new Stripe(key);
  return _stripe;
}
