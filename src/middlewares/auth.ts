import { NextFunction, Request, Response } from "express";
import { env } from "../config";
import jwt from 'jsonwebtoken';
import { ERROR_CODES, HTTP_STATUS } from "../shared/constants";
import { AUTH_ERROR_CODES } from "../features/auth/errorCodes";

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers['authorization']?.split('Bearer ')[1];

        if (!token) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ errorCode: AUTH_ERROR_CODES.NO_TOKEN });
            return;
        }

        const decoded = jwt.verify(token, env.JWT_SECRET!) as { userId: string };
        (req as any).userId = decoded.userId;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) { 
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ errorCode: AUTH_ERROR_CODES.TOKEN_EXPIRED });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ errorCode: AUTH_ERROR_CODES.INVALID_TOKEN });
            return;
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR });
    }
}
 
export default authMiddleware;