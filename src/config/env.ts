import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret',
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
};

if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}
