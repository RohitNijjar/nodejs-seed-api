import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export const AuthController = {
    register: async (req: Request, res: Response): Promise<void> => {
        res.status(200).json({
            message: 'You have access to this protected resource!',
        });
     },
}