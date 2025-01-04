import Redis from 'ioredis';

import { env, logger } from '../../config';

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  tls: env.REDIS_TLS === 'true' ? {} : undefined,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis!');
});

redisClient.on('error', (error) => {
  logger.error(`Redis error - ${error.message}`);
});

export { redisClient };
