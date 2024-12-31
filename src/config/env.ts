import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_TOKEN_EXPIRATION: process.env.EMAIL_TOKEN_EXPIRATION || '1d',
  EMAIL_JWT_SECRET: process.env.EMAIL_JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  CLIENT_URL: process.env.CLIENT_URL,
};

if (!env.JWT_SECRET || !env.EMAIL_JWT_SECRET) {
  throw new Error('secret is not defined in environment variables.');
}
