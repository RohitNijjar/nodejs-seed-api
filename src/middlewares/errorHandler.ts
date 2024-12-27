import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../shared/constants/httpStatus";
import { logger } from "../config";
import { createApiResponse } from "../shared/utils/responseHandler";
import { ERROR_CODES } from "../shared/constants";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error(err.message);
    const statusCode = res.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json(
        createApiResponse({
            errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
            statusCode,
        })
    );

    next();
 };