/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AUTH_ERROR_CODES } from '../features/auth/errorCodes';
import { ERROR_CODES, HTTP_STATUS } from '../shared/constants';
import { verifyToken } from '../shared/utils/jwt';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers['authorization']?.split('Bearer ')[1];

    if (!token) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        errorCode: AUTH_ERROR_CODES.NO_TOKEN,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      });
      return;
    }

    const decoded = verifyToken(token);
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        errorCode: AUTH_ERROR_CODES.TOKEN_EXPIRED,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        errorCode: AUTH_ERROR_CODES.INVALID_TOKEN,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
      return;
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

export { authMiddleware };
