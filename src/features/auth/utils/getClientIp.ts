import { Request } from 'express';

export const getClientIp = (req: Request): string | undefined => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();
  }

  return req.ip;
};
