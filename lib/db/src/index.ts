import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// The storefront doesn't need the database; only the (optional) shared
// product list does. Without DATABASE_URL the server still starts.
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set: the shared product list is off.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
