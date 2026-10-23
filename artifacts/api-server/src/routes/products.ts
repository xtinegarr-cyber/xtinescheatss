import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db, productsStoreTable } from '@workspace/db';
import { logger } from '../lib/logger';
import { isAdminKey } from './admin';

const SINGLETON_ID = 'singleton';

// Ensure the table exists on first boot (idempotent).
async function ensureTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products_store (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    logger.info('products_store table ready');
  } catch (err) {
    logger.error({ err }, 'Failed to ensure products_store table');
  }
}

ensureTable();

export const productsRouter = Router();

// GET /api/products — public, returns current product list
productsRouter.get('/products', async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(productsStoreTable)
      .where(eq(productsStoreTable.id, SINGLETON_ID));

    if (rows.length === 0) return res.json([]);
    return res.json(JSON.parse(rows[0].data));
  } catch (err) {
    logger.error({ err }, 'Failed to read products from DB');
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

// POST /api/products — admin only, replaces the product list
productsRouter.post('/products', async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { adminKey, products } = req.body as { adminKey?: string; products?: any[] };

  if (!isAdminKey(adminKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'products must be an array' });
  }

  try {
    await db
      .insert(productsStoreTable)
      .values({ id: SINGLETON_ID, data: JSON.stringify(products) })
      .onConflictDoUpdate({
        target: productsStoreTable.id,
        set: {
          data: JSON.stringify(products),
          updatedAt: new Date(),
        },
      });

    logger.info({ count: products.length }, 'Products saved to DB');
    return res.json({ ok: true, count: products.length });
  } catch (err) {
    logger.error({ err }, 'Failed to save products to DB');
    return res.status(500).json({ error: 'Failed to save products' });
  }
});
