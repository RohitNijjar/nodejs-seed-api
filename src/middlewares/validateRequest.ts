import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

import { ERROR_CODES, HTTP_STATUS } from '../shared/constants';
import { ApiError } from '../shared/errors';

export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw new ApiError(
        'Validation errors',
        ERROR_CODES.INVALID_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
        errorMessage,
      );
    }

    next();
  };
};
