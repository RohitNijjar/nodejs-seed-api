import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config';
import { initSentry } from './config/sentry';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { apiRoutes } from './routes';

const sentryConfig = {
  dsn: env.SENTRY_DSN || '',
  environment: env.NODE_ENV || 'development',
  release: `build-${Date.now()}`,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  debug: env.NODE_ENV === 'development',
};

initSentry(sentryConfig);

// eslint-disable-next-line import/order
import express, { Request, Response } from 'express';

const app = express();

const corsOptions = {
  origin: env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-forwarded-for'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api/v1', apiRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).send({ message: 'API is running!' });
});

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

setupSwagger(app);

export { app };
