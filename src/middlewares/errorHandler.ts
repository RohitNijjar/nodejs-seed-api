import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../shared/constants/httpStatus";
import { logger } from "../config";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error(err.message);
    const statusCode = res.statusCode !== 200 ? res.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });

    next();
 };