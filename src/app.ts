import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import api from './routes';
import { env } from './config';

const app = express();

const corsOptions = {
    origin: env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE',],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/v1', api);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send({ message: 'API is running!' });
});

app.use(errorHandler);

export default app;