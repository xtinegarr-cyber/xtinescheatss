import app, { storeDir } from "./app";
import { submitSitemapOnce } from "./lib/indexnow";
import { logger } from "./lib/logger";

// Coolify: set the resource's exposed port to this (3000 unless PORT is set).
const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // A minute after a deploy (once the new version is the one answering),
  // tell Bing about the shop's pages. See lib/indexnow.ts.
  setTimeout(() => void submitSitemapOnce(storeDir), 60_000).unref();
});
