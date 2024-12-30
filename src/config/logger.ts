import { createLogger, format, transports } from 'winston';

import { env } from './env';

const { combine, timestamp, errors, colorize, simple } = format;

export const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'MM-DD-YYYY HH:mm:ss' }),
    errors({ stack: true }),
    colorize(),
    simple(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});
