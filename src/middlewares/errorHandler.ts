import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../shared/constants/httpStatus";
import { logger } from "../config";
import { createApiResponse } from "../shared/utils/responseHandler";
import { ERROR_CODES } from "../shared/constants";
import { AppError } from "../shared/errors";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof AppError) {
        logger.error(`${err.statusCode} - ${err.errorCode} - ${err.message}`);
        res.status(err.statusCode).json(
            createApiResponse({
                errorCode: err.errorCode,
                statusCode: err.statusCode,
            })
        );
    } else {
        logger.error(`Unexpected error: ${err.message}`);
        const statusCode = res.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            createApiResponse({
                errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
                statusCode,
            })
        );
    }

    next();
 };