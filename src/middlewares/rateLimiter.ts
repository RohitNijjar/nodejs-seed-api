/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Redis from 'ioredis';

import { ApiRateLimiter, getClientIp, getUserId } from '../features/auth/utils';
import { redisClient } from '../shared/redis/redisClient';

const createRateLimiters = (redisClient: Redis) => {
  const userLimiter = new ApiRateLimiter(
    redisClient,
    {
      keyPrefix: 'user-rate-limiter',
      points: 100,
      duration: 60,
      blockDuration: 60,
    },
    {
      skipFailedRequests: true,
      customResponseMessage: 'Too many requests.',
    },
  );

  const ipLimiter = new ApiRateLimiter(
    redisClient,
    {
      keyPrefix: 'ip-rate-limiter',
      points: 50,
      duration: 60,
      blockDuration: 120,
    },
    {
      customResponseMessage: 'Rate limit exceeded.',
    },
  );

  return {
    rateLimitByUserMiddleware: userLimiter.createMiddleware(getUserId),
    rateLimitByIpMiddleware: ipLimiter.createMiddleware(getClientIp),
  };
};

export const { rateLimitByUserMiddleware, rateLimitByIpMiddleware } =
  createRateLimiters(redisClient);
