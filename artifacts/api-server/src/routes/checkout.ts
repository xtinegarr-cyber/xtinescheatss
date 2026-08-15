import { Router, type Request, type Response } from 'express';
import { stripe } from '../lib/stripe';
import { logger } from '../lib/logger';

const router = Router();

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

    const session = await stripe.checkout.sessions.create({
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
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
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
