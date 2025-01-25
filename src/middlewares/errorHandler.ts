import { NextFunction, Request, Response } from 'express';

import { logger } from '../config';
import { ERROR_CODES } from '../shared/constants';
import { HTTP_STATUS } from '../shared/constants/httpStatus';
import { ApiError } from '../shared/errors';
import { createApiResponse } from '../shared/utils/responseHandler';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    logger.error(`${err.errorCode} - ${err.message} - ${err.statusCode}`);
    if (err.errorMessage) {
      logger.error(`${err.errorMessage}`);
    }

    res.status(err.statusCode).json(
      createApiResponse({
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        message: err.errorMessage,
      }),
    );
  } else {
    logger.error(`Unexpected error: ${err.stack} - ${err.message}`);
    const statusCode =
      res.statusCode !== 200
        ? res.statusCode
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json(
      createApiResponse({
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        statusCode,
      }),
    );
  }

  next();
};
