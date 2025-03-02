import jwt from 'jsonwebtoken';

import { env } from '../../../config';
import { HTTP_STATUS, ERROR_CODES, BLACKLIST_PREFIX } from '../../constants';
import { ApiError } from '../../errors';
import { UserPayload } from '../../models';
import { getRedisValueAsync, setRedisKeyAsync } from '../../redis/redisClient';

export const generateToken = (
  payload: UserPayload,
  jwtSecret = env.JWT_SECRET ?? '',
  expiration: string = env.JWT_EXPIRATION,
): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: Number(expiration) });
};

export const verifyToken = (
  token: string,
  jwtSecret = env.JWT_SECRET ?? '',
): UserPayload => {
  try {
    return jwt.verify(token, jwtSecret) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        'JWT error: Token expired',
        ERROR_CODES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(
        'JWT error: Invalid token',
        ERROR_CODES.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
    throw new ApiError('JWT error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const inValidateToken = async (token: string): Promise<boolean> => {
  try {
    const tokenKey = `${BLACKLIST_PREFIX}${token}`;
    const expiration = Number(env.REFRESH_TOKEN_EXPIRATION_BLACKLIST);
    const result = await setRedisKeyAsync(tokenKey, expiration, 'blacklisted');
    return result === 'OK';
  } catch {
    throw new ApiError(
      'Token invalidation error: redis saving failed',
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
};

export const isTokenBlacklisted = async (
  refreshToken: string,
): Promise<boolean> => {
  const tokenKey = `${BLACKLIST_PREFIX}${refreshToken}`;
  const isBlacklisted = await getRedisValueAsync(tokenKey);
  return Boolean(isBlacklisted);
};
