import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../lib/logger';

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'Rubeans2124!';

// Products persist to a JSON file so they survive server restarts.
// Set DATA_DIR (e.g. to a Railway volume mount path like /data) for
// durability across redeploys; defaults to ./data next to the server.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadStore(): any[] {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      logger.info({ count: parsed.length }, 'Loaded products from disk');
      return parsed;
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.error({ err }, 'Failed to load products file');
    }
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function persistStore(products: any[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = PRODUCTS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(products, null, 2), 'utf8');
  fs.renameSync(tmp, PRODUCTS_FILE);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: any[] = loadStore();

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
  try {
    persistStore(products);
  } catch (err) {
    logger.error({ err }, 'Failed to persist products to disk');
    return res.status(500).json({ error: 'Failed to save products' });
  }
  store = products;
  return res.json({ ok: true, count: store.length });
});
