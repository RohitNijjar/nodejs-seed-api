/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

import { logger } from '../config';
import { ERROR_CODES, HTTP_STATUS } from '../shared/constants';
import { ApiError } from '../shared/errors';
import { isTokenBlacklisted, verifyToken } from '../shared/utils/JWT/jwt';
import { createApiResponse } from '../shared/utils/responseHandler';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers['authorization']?.split('Bearer ')[1];
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse({
          errorCode: ERROR_CODES.NO_REFRESH_TOKEN,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        }),
      );
      return;
    }

    const isBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse({
          errorCode: ERROR_CODES.REFRESH_TOKEN_EXPIRED,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        }),
      );
      return;
    }

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse({
          errorCode: ERROR_CODES.NO_TOKEN,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        }),
      );
      return;
    }

    const decoded = verifyToken(token);
    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        createApiResponse({
          errorCode: error.errorCode,
          statusCode: error.statusCode,
        }),
      );
      return;
    }

    logger.error(`Unexpected auth error: ${error}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createApiResponse({
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

export { authMiddleware };
