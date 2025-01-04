import { RateLimiterRedis } from 'rate-limiter-flexible';

import { redisClient } from '../redis/redisClient';

const createRateLimiter = (
  keyPrefix: string,
  points: number,
  duration: number,
): RateLimiterRedis => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix,
    points,
    duration,
    blockDuration: 60,
  });
};

export const rateLimiterByUser = createRateLimiter(
  'user-rate-limiter',
  100,
  60,
);
export const rateLimiterByIp = createRateLimiter('ip-rate-limiter', 50, 60);
