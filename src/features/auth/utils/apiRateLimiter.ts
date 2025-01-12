import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

import { ERROR_CODES, HTTP_STATUS } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { createApiResponse } from '../../../shared/utils/responseHandler';
import { RateLimitConfig, RateLimitOptions } from '../models';

type LimiterIdentifierFn = (req: Request) => string | undefined;

export class ApiRateLimiter {
  private limiter: RateLimiterRedis;
  private options: RateLimitOptions;

  constructor(
    redisClient: Redis,
    config: RateLimitConfig,
    options: RateLimitOptions = {},
  ) {
    this.limiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: config.keyPrefix,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration || 60,
    });

    this.options = {
      skipFailedRequests: false,
      skipSuccessfulRequests: false,
      ...options,
    };
  }

  createMiddleware(identifierFn: LimiterIdentifierFn) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      if (
        (this.options.skipFailedRequests && res.statusCode >= 400) ||
        (this.options.skipSuccessfulRequests &&
          res.statusCode >= 200 &&
          res.statusCode < 300)
      ) {
        return next();
      }

      try {
        const identifier = identifierFn(req);
        if (!identifier) {
          throw new ApiError(
            'Rate limiter error: no identifier',
            ERROR_CODES.INVALID_REQUEST,
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        const result = await this.limiter.consume(identifier);
        this.setRateLimitHeaders(res, result);
        next();
      } catch (error) {
        if (error instanceof ApiError) {
          res.status(HTTP_STATUS.BAD_REQUEST).json(
            createApiResponse({
              errorCode: ERROR_CODES.INVALID_REQUEST,
              statusCode: HTTP_STATUS.BAD_REQUEST,
              message: error.message,
            }),
          );
          return;
        }

        if (error instanceof Error) {
          res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
            createApiResponse({
              errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
              statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
              message: this.options.customResponseMessage || error.message,
            }),
          );
          return;
        }
        next(error);
      }
    };
  }

  private setRateLimitHeaders(
    res: Response,
    rateLimitResult: RateLimiterRes,
  ): void {
    res.setHeader('X-RateLimit-Limit', this.limiter.points);
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remainingPoints);
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitResult.msBeforeNext).getTime() / 1000,
    );
    res.setHeader(
      'Retry-After',
      Math.ceil(rateLimitResult.msBeforeNext / 1000),
    );
  }
}
