import Redis from 'ioredis';
import { promisify } from 'util';

import { env, logger } from '../../config';

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  tls: env.REDIS_TLS === 'true' ? {} : undefined,
});

const closeRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed.');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

const getRedisValueAsync = promisify(redisClient.get).bind(redisClient);
const setRedisKeyAsync = promisify(redisClient.setex).bind(redisClient);

redisClient.on('connect', () => {
  logger.info('Connected to Redis!');
});

redisClient.on('error', (error) => {
  logger.error(`Redis error - ${error.message}`);
});

export {
  redisClient,
  closeRedisConnection,
  getRedisValueAsync,
  setRedisKeyAsync,
};
