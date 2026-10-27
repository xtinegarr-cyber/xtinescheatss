import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { handleStripeWebhook } from "./routes/checkout";
import { INDEXNOW_KEY_PATH, indexNowKey } from "./lib/indexnow";

const app: Express = express();

// Behind Coolify's proxy: use the visitor's real IP (for login rate limits).
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));

// ── Stripe webhook MUST be registered before express.json() ──────────────────
// Stripe sends raw Buffer bodies; express.json() would parse it and break
// signature verification.
app.post(
  "/api/checkout/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// ── Standard middleware for all other routes ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// The IndexNow key (see lib/indexnow.ts): search engines read it to check
// that the shop's "these pages changed" messages really come from here.
app.get(INDEXNOW_KEY_PATH, (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.type("text/plain").send(indexNowKey());
});

// ── Storefront ────────────────────────────────────────────────────────────────
// The built store (artifacts/xtine-store) is served by this same server, so
// the whole site runs as one app on one domain. Without a build (local API
// development) only the API runs.
export const storeDir = path.resolve(process.env.STORE_DIR ?? "artifacts/xtine-store/dist/public");
const storeIndex = path.join(storeDir, "index.html");

if (fs.existsSync(storeIndex)) {
  app.use(
    express.static(storeDir, {
      // /rust serves rust.html: the product pages made at build time.
      extensions: ["html"],
      setHeaders(res, file) {
        // Vite's hashed files never change; everything else is re-checked.
        const hashed = file.includes(`${path.sep}assets${path.sep}`);
        res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "no-cache");
      },
    }),
  );
  // Pages handled in the browser (/product/rust, /order-complete, ...).
  app.use((req, res, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(storeIndex);
  });
} else {
  logger.warn({ storeDir }, "Storefront build not found; serving the API only");
}

export default app;
