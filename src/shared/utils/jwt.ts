import jwt from 'jsonwebtoken';

import { env } from '../../config';
import { UserPayload } from '../models';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: env.JWT_EXPIRATION });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, env.JWT_SECRET!) as UserPayload;
};
