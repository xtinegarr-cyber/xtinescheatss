import { Router } from 'express';

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'Rubeans2124!';

// In-memory product store — lives for the lifetime of the Railway process.
// Starts empty; the frontend falls back to its built-in defaults on first load,
// and the admin's first "Save All" populates this for all visitors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: any[] = [];

export const productsRouter = Router();

// GET /api/products — public, returns current product list
productsRouter.get('/products', (_req, res) => {
  res.json(store);
});

// POST /api/products — admin only, replaces the product list
productsRouter.post('/products', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { adminKey, products } = req.body as { adminKey?: string; products?: any[] };
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'products must be an array' });
  }
  store = products;
  return res.json({ ok: true, count: store.length });
});
