import jwt from 'jsonwebtoken';

import { env } from '../../config';
import { AUTH_ERROR_CODES } from '../../features/auth/errorCodes';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import { ApiError } from '../errors';
import { UserPayload } from '../models';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: env.JWT_EXPIRATION });
};

export const generateEmailVerificationToken = (
  payload: UserPayload,
): string => {
  return jwt.sign(payload, env.EMAIL_JWT_SECRET!, {
    expiresIn: env.EMAIL_TOKEN_EXPIRATION,
  });
};

export const verifyToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET!) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        'JWT error: Token expired',
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(
        'JWT error: Invalid token',
        AUTH_ERROR_CODES.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
    throw new ApiError('JWT error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const verifyEmailVerificationToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, env.EMAIL_JWT_SECRET!) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        'JWT error: Email verification token expired',
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(
        'JWT error: Invalid email verification token',
        AUTH_ERROR_CODES.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
    throw new ApiError(
      'JWT error: Server error',
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
};
