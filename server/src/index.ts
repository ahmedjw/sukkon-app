import pino from 'pino';
import { buildApp } from './app.js';
import { env } from './env.js';
import { prisma } from './db.js';

const logger = pino();
const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(`[sukoun-server] listening on :${env.PORT} /v1 (env=${env.NODE_ENV})`);
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`received ${signal}, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Force-exit if connections refuse to drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
