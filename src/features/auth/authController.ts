import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { createApiResponse } from "../../shared/utils/responseHandler";
import { AuthService } from "./authService";

export const AuthController = {
    register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, password, firstName, lastName } = req.body;
        try {
            const newUser = await AuthService.register(email, password, firstName, lastName);

            res.status(HTTP_STATUS.CREATED).json(createApiResponse({
                data: newUser,
                statusCode: HTTP_STATUS.CREATED,
            }));
        } catch (error) {
            next(error);
        }
    },

    login: async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
        const { email, password } = req.body;
        try {
            const user = await AuthService.login(email, password);

            res.status(HTTP_STATUS.OK).json(createApiResponse({
                data: user,
                statusCode: HTTP_STATUS.OK,
            }));
        } catch (error) {
            next(error);
        }
    },
}