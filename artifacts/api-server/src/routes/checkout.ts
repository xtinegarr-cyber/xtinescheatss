import { Router, type Request, type Response } from 'express';
import {
  GetCheckoutConfirmationQueryParams,
  GetCheckoutConfirmationResponse,
} from '@workspace/api-zod';
import { getStripe } from '../lib/stripe';
import { logger } from '../lib/logger';

const router = Router();
const fulfillmentUrl = 'https://mega.nz/folder/KuAwiKDA#Vd7pqEQD0cuEnzfAvsuXFw.';

// ── POST /api/checkout/create-session ────────────────────────────────────────
// Called by the frontend to create a Stripe Checkout session.
// Returns { url } — the hosted checkout page URL to redirect the user to.

router.post('/checkout/create-session', async (req: Request, res: Response) => {
  try {
    const { items, successUrl, cancelUrl } = req.body as {
      items: { name: string; duration: string; price: number; qty: number }[];
      successUrl: string;
      cancelUrl: string;
    };

    if (!items?.length) {
      res.status(400).json({ error: 'No items provided' });
      return;
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `${item.duration} access`,
          },
          unit_amount: Math.round(item.price * 100), // convert dollars → cents
        },
        quantity: item.qty,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, 'Stripe checkout session creation failed');
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ── GET /api/checkout/confirm ─────────────────────────────────────────────────
// The storefront calls this after Stripe redirects the buyer back with a session ID.
// The fulfillment URL is only returned when Stripe confirms a paid session.

router.get('/checkout/confirm', async (req: Request, res: Response): Promise<void> => {
  const params = GetCheckoutConfirmationQueryParams.safeParse(req.query);
  if (!params.success || !params.data.session_id.trim()) {
    res.status(400).json({ error: 'A valid checkout session is required' });
    return;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(params.data.session_id, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      req.log.warn({ paymentStatus: session.payment_status }, 'Unpaid checkout confirmation requested');
      res.status(400).json({ error: 'This payment has not been completed yet' });
      return;
    }

    const confirmation = GetCheckoutConfirmationResponse.parse({
      paymentStatus: 'paid',
      items: (session.line_items?.data ?? []).map((item) => ({
        name: item.description,
        quantity: item.quantity ?? 1,
      })),
      fulfillmentUrl,
    });

    req.log.info({ itemCount: confirmation.items.length }, 'Paid checkout confirmed');
    res.json(confirmation);
  } catch (err) {
    const stripeStatus = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined;

    if (stripeStatus === 404) {
      req.log.warn('Checkout confirmation requested for unknown session');
      res.status(404).json({ error: 'Checkout session not found' });
      return;
    }

    req.log.error({ err }, 'Stripe checkout confirmation failed');
    res.status(500).json({ error: 'Unable to confirm this checkout session' });
  }
});

// ── POST /api/checkout/webhook ────────────────────────────────────────────────
// Stripe sends signed events here after payment.
// Registered in app.ts BEFORE express.json() so it receives raw Buffer body.
// Set STRIPE_WEBHOOK_SECRET in your environment (get it from Stripe Dashboard → Webhooks).

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: import('stripe').Stripe.Event;

  if (webhookSecret) {
    try {
      event = getStripe().webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      logger.error({ err }, 'Webhook signature verification failed');
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }
  } else {
    // No webhook secret configured — parse raw body manually (dev only).
    // Set STRIPE_WEBHOOK_SECRET in production for security.
    try {
      event = JSON.parse((req.body as Buffer).toString()) as import('stripe').Stripe.Event;
      logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)');
    } catch {
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session;
      logger.info({ sessionId: session.id, amountTotal: session.amount_total }, 'Payment completed');
      // TODO: persist order to database, send confirmation email, trigger fulfillment, etc.
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as import('stripe').Stripe.PaymentIntent;
      logger.warn({ paymentIntentId: paymentIntent.id }, 'Payment failed');
      break;
    }
    default:
      logger.info({ type: event.type }, 'Unhandled Stripe event');
  }

  res.status(200).json({ received: true });
}

export default router;
