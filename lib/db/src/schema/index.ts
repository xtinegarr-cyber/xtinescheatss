import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Single-row store for the admin-managed product list.
// One row (id = "singleton") holds the full JSON array.
export const productsStoreTable = pgTable("products_store", {
  id: text("id").primaryKey(),
  data: text("data").notNull().default("[]"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
