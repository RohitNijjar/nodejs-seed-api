import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`${key} is not defined in environment variables.`);
  }
  return value || defaultValue!;
};

export const env = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: getEnvVariable('PORT', '5000'),
  MONGO_URI: getEnvVariable('MONGO_URI'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRATION: getEnvVariable('JWT_EXPIRATION', '15m'),
  ALLOWED_ORIGIN: getEnvVariable('ALLOWED_ORIGIN', '*'),
  EMAIL_SERVICE: getEnvVariable('EMAIL_SERVICE'),
  EMAIL_JWT_EXPIRATION: getEnvVariable('EMAIL_TOKEN_EXPIRATION', '10m'),
  EMAIL_JWT_SECRET: getEnvVariable('EMAIL_JWT_SECRET'),
  RESET_PASSWORD_JWT_SECRET: getEnvVariable('RESET_PASSWORD_JWT_SECRET'),
  RESET_PASSWORD_JWT_EXPIRATION: getEnvVariable(
    'RESET_PASSWORD_JWT_EXPIRATION',
    '5m',
  ),
  REFRESH_TOKEN_SECRET: getEnvVariable('REFRESH_TOKEN_SECRET'),
  REFRESH_TOKEN_EXPIRATION: getEnvVariable('REFRESH_TOKEN_EXPIRATION', '7d'),
  REFRESH_TOKEN_EXPIRATION_BLACKLIST: getEnvVariable(
    'REFRESH_TOKEN_EXPIRATION_BLACKLIST',
  ),
  ADMIN_EMAIL: getEnvVariable('ADMIN_EMAIL'),
  ADMIN_PASSWORD: getEnvVariable('ADMIN_PASSWORD'),
  CLIENT_URL: getEnvVariable('CLIENT_URL'),
  REDIS_HOST: getEnvVariable('REDIS_HOST'),
  REDIS_PORT: getEnvVariable('REDIS_PORT'),
  REDIS_PASSWORD: getEnvVariable('REDIS_PASSWORD'),
  REDIS_TLS: getEnvVariable('REDIS_TLS', 'false'),
  GOOGLE_OAUTH_URL: getEnvVariable('GOOGLE_OAUTH_URL'),
  GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVariable('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnvVariable('GOOGLE_REDIRECT_URI'),
  GOOGLE_TOKEN_URL: getEnvVariable('GOOGLE_TOKEN_URL'),
};
