// IndexNow: after each deploy, tells Bing about every page in the shop's
// sitemap (products, guides, home), so new or changed pages are picked up
// within minutes instead of whenever Bing next crawls. Bing shares these
// with the other IndexNow search engines (Yandex, Naver, Seznam, Yep);
// Google doesn't use IndexNow (it reads the sitemap instead).
//
// The shop's pages only change when it's rebuilt, so once per deploy is
// all it takes; restarting without a new deploy doesn't send them again.
// Nothing to set up. INDEXNOW=off turns it off.
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger";

const ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";
const MAX_URLS = 10_000; // IndexNow's limit per request
const MAX_TRIES = 5;

/** The shop's public https address, or null (local testing, or turned off). */
function siteOrigin(): string | null {
  if ((process.env.INDEXNOW ?? "").trim().toLowerCase() === "off") return null;
  const raw = (process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "https://xtinecheats.com").trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * The key search engines check at /indexnow-key.txt. It's public by design
 * (it only shows the pings come from whoever runs this domain), and the
 * same on every deploy, so a rolling update never serves a different one.
 * INDEXNOW_KEY can set your own (8-128 letters, numbers or dashes).
 */
export function indexNowKey(): string {
  const custom = (process.env.INDEXNOW_KEY ?? "").trim();
  if (/^[A-Za-z0-9-]{8,128}$/.test(custom)) return custom;
  const host = new URL(siteOrigin() ?? "https://xtinecheats.com").host;
  return createHash("sha256").update(`indexnow:${host}`).digest("hex").slice(0, 32);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sends every page in the built sitemap, once per build. Never throws. */
export async function submitSitemapOnce(storeDir: string, { retryDelayMs = 60_000 } = {}): Promise<void> {
  try {
    const origin = siteOrigin();
    if (!origin) return;
    const sitemap = await fs.readFile(path.join(storeDir, "sitemap.xml"), "utf8").catch(() => null);
    if (!sitemap) return;
    const host = new URL(origin).host;
    const urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
      .map((match) => match[1])
      .filter((url) => {
        try {
          return new URL(url).host === host;
        } catch {
          return false;
        }
      })
      .slice(0, MAX_URLS);
    if (!urls.length) return;

    // Remembered next to the build, so only a new deploy sends them again.
    const built = await fs.stat(path.join(storeDir, "index.html")).then((s) => String(s.mtimeMs)).catch(() => "");
    const build = createHash("sha256").update(`${sitemap}|${built}`).digest("hex").slice(0, 16);
    const marker = path.join(storeDir, ".indexnow-sent");
    if ((await fs.readFile(marker, "utf8").catch(() => "")).trim() === build) return;

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      let status = 0;
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ host, key: indexNowKey(), keyLocation: `${origin}${INDEXNOW_KEY_PATH}`, urlList: urls }),
          signal: AbortSignal.timeout(15_000),
        });
        status = res.status;
      } catch (err) {
        logger.warn({ err: (err as Error)?.message }, "IndexNow couldn't be reached");
      }
      if (status === 200 || status === 202) {
        // 202: the key is new and still being checked; the pages are accepted.
        logger.info({ pages: urls.length }, `IndexNow: told search engines about ${urls.length} pages`);
        await fs.writeFile(marker, build).catch(() => {});
        return;
      }
      if (status !== 0 && status !== 429 && status < 500) {
        logger.warn({ status }, "IndexNow turned the update down. Pages are still found through the sitemap.");
        return;
      }
      if (attempt < MAX_TRIES) await sleep(attempt * retryDelayMs); // busy or unreachable: wait, then try again
    }
  } catch (err) {
    logger.warn({ err: (err as Error)?.message }, "IndexNow skipped");
  }
}
