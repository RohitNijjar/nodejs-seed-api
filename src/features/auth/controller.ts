import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { createApiResponse } from "../../shared/utils/responseHandler";

export const AuthController = {
    register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).userId;

            res.status(HTTP_STATUS.CREATED).json(createApiResponse({
                data: { userId },
                statusCode: HTTP_STATUS.CREATED,
            }));
        } catch (error) {
            next(error);
        }
    },
}