import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { AppError } from "../shared/errors";
import { ERROR_CODES, HTTP_STATUS } from "../shared/constants";

export const validateRequest = (schema: ObjectSchema) => { 
    return (req: Request, res: Response, next: NextFunction): void => { 
        const { error } = schema.validate(req.body);
        if (error) { 
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            throw new AppError(errorMessage, ERROR_CODES.INVALID_REQUEST, HTTP_STATUS.BAD_REQUEST);
        }

        next();
    };
};