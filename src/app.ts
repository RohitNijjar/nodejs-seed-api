import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { apiRoutes } from './routes';

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

app.use(errorHandler);

export { app };
