import { Router, type Request, type Response } from 'express';
import {
  GetCheckoutConfirmationQueryParams,
  GetCheckoutConfirmationResponse,
} from '@workspace/api-zod';
import { getStripe } from '../lib/stripe';
import { logger } from '../lib/logger';

const router = Router();
const fulfillmentUrl = 'https://mega.nz/folder/KuAwiKDA#Vd7pqEQD0cuEnzfAvsuXFw.';
const MAX_QUANTITY = 100_000;

type UnitCatalogOption = {
  name: string;
  unitLabel: string;
  unitPriceInThousandths: number;
  minimumSubtotalCents: number;
};

type CatalogProduct = {
  name: string;
  // Present when the product offers duration-based service plans.
  durations?: { label: string; priceCents: number }[];
  // Present when the product offers flat/unit-priced items (optionally
  // alongside durations, e.g. Rust's cheat service + one-time accounts).
  options?: UnitCatalogOption[];
};

// Stripe prices are derived exclusively from this server-owned catalog.
const checkoutCatalog: Record<string, CatalogProduct> = {
  'arc-raiders': {
    name: 'Arc Raiders',
    durations: [{ label: '1 Day', priceCents: 499 }, { label: '3 Days', priceCents: 1299 }, { label: '7 Days', priceCents: 1999 }, { label: '30 Days', priceCents: 3999 }],
  },
  'hwid-spoofer': {
    name: 'HWID Spoofer',
    durations: [{ label: '1 Day', priceCents: 299 }, { label: '3 Days', priceCents: 599 }, { label: '7 Days', priceCents: 999 }, { label: '30 Days', priceCents: 1999 }],
  },
  'rainbow-six-siege': {
    name: 'Rainbow Six Siege',
    durations: [{ label: '1 Day', priceCents: 499 }, { label: '3 Days', priceCents: 1299 }, { label: '7 Days', priceCents: 2899 }, { label: '30 Days', priceCents: 5899 }],
  },
  rust: {
    name: 'Rust',
    durations: [{ label: '1 Day', priceCents: 699 }, { label: '3 Days', priceCents: 1499 }, { label: '7 Days', priceCents: 2899 }, { label: '30 Days', priceCents: 5599 }],
    options: [
      { name: 'Rust Account', unitLabel: 'account', unitPriceInThousandths: 5_750, minimumSubtotalCents: 0 },
    ],
  },
  donutsmp: {
    name: 'DonutSMP',
    options: [
      { name: 'In-Game Money', unitLabel: 'million', unitPriceInThousandths: 81, minimumSubtotalCents: 400 },
      { name: 'Skeleton Spawner', unitLabel: 'spawner', unitPriceInThousandths: 450, minimumSubtotalCents: 400 },
      { name: 'Elytra', unitLabel: 'elytra', unitPriceInThousandths: 24_580, minimumSubtotalCents: 400 },
    ],
  },
};

// ── POST /api/checkout/create-session ────────────────────────────────────────
// Called by the frontend to create a Stripe Checkout session.
// Returns { url } — the hosted checkout page URL to redirect the user to.

router.post('/checkout/create-session', async (req: Request, res: Response) => {
  try {
    const { items, successUrl, cancelUrl } = req.body as {
      items: { productId: string; durationIndex?: number; optionIndex?: number; qty: number }[];
      successUrl: string;
      cancelUrl: string;
    };

    if (!items?.length) {
      res.status(400).json({ error: 'No items provided' });
      return;
    }

    const lineItems: {
      price_data: {
        currency: 'usd';
        product_data: { name: string; description: string };
        unit_amount: number;
      };
      quantity: number;
    }[] = [];

    for (const item of items) {
      if (
        typeof item.productId !== 'string'
        || !Number.isInteger(item.qty)
        || item.qty < 1
        || item.qty > MAX_QUANTITY
      ) {
        res.status(400).json({ error: 'Invalid checkout item quantity' });
        return;
      }

      const product = checkoutCatalog[item.productId];
      if (!product) {
        res.status(400).json({ error: 'A requested product is unavailable' });
        return;
      }

      // Items with an optionIndex are flat/unit-priced purchases (e.g. DonutSMP
      // items, Rust accounts); everything else is a duration-based plan.
      if (item.optionIndex !== undefined) {
        const optionIndex = item.optionIndex;
        if (
          !product.options
          || typeof optionIndex !== 'number'
          || !Number.isInteger(optionIndex)
          || optionIndex < 0
          || optionIndex >= product.options.length
        ) {
          res.status(400).json({ error: 'Invalid item option' });
          return;
        }

        const option = product.options[optionIndex];
        // Rates are stored as thousandths of a dollar so sub-cent unit prices
        // (e.g. $0.081) stay exact. The combined quantity total is rounded
        // once to Stripe's whole cents.
        const subtotalCents = Math.round((option.unitPriceInThousandths * item.qty) / 10);
        if (subtotalCents < option.minimumSubtotalCents) {
          res.status(400).json({
            error: `${option.name} requires a minimum $${(option.minimumSubtotalCents / 100).toFixed(2)} subtotal`,
          });
          return;
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.name} — ${option.name} — ${item.qty.toLocaleString()} ${option.unitLabel}${item.qty === 1 ? '' : 's'}`,
              description: `${product.name} item purchase`,
            },
            unit_amount: subtotalCents,
          },
          quantity: 1,
        });
        continue;
      }

      const durationIndex = item.durationIndex;
      if (
        !product.durations
        || typeof durationIndex !== 'number'
        || !Number.isInteger(durationIndex)
        || durationIndex < 0
        || durationIndex >= product.durations.length
      ) {
        res.status(400).json({ error: 'Invalid product duration' });
        return;
      }

      const duration = product.durations[durationIndex];
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `${duration.label} access`,
          },
          unit_amount: duration.priceCents,
        },
        quantity: item.qty,
      });
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
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
