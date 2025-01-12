/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';

export const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.userId;
};
