import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './env.js';
import { v1 } from './routes/index.js';
import { errorHandler } from './http/error.js';

export function buildApp() {
  const app = express();

  app.use(helmet());
  const explicitOrigins = env.CORS_ORIGIN === '*' ? null : env.CORS_ORIGIN.split(',').map((s) => s.trim());
  app.use(
    cors({
      origin: explicitOrigins ?? true,
      // Reflecting arbitrary origins with credentials is unsafe — only allow credentials for an explicit allowlist.
      credentials: explicitOrigins !== null,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(
    pinoHttp({
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino/file', options: { destination: 1 } }
          : undefined,
      autoLogging: { ignore: (req) => req.url === '/v1/healthz' },
    }),
  );

  app.use('/v1', v1);

  app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
  app.use(errorHandler);
  return app;
}
