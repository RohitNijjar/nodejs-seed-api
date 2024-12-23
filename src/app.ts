import express from 'express';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app = express();

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE',],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors(corsOptions));

connectDB();

app.get('/example', (req, res) => {
    res.send('Hello, world!');
});

export default app;