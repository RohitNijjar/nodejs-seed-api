/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { ERROR_CODES, HTTP_STATUS } from '../shared/constants';
import {
  rateLimiterByIp,
  rateLimiterByUser,
} from '../shared/rateLimiter/rateLimiter';
import { createApiResponse } from '../shared/utils/responseHandler';

export const rateLimitByUserIdMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse({
          errorCode: ERROR_CODES.UNAUTHORIZED,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        }),
      );

      return;
    }

    await rateLimiterByUser.consume(userId);
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
        createApiResponse({
          errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
          message: error.message,
        }),
      );
      return;
    }
    next(error);
  }
};

export const rateLimitByIpMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = req.ip;
    if (!ip) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        createApiResponse({
          errorCode: ERROR_CODES.INVALID_REQUEST,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        }),
      );
      return;
    }
    await rateLimiterByIp.consume(ip);
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
        createApiResponse({
          errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
          message: error.message,
        }),
      );
      return;
    }
    next(error);
  }
};
