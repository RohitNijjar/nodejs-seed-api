import { NextFunction, Request, Response } from "express";
import { ErrorMessages } from "../shared/constants";
import { env } from "../config";
import jwt from 'jsonwebtoken';

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers['authorization']?.split('Bearer ')[1];

        if (!token) {
            res.status(401).json({ message: ErrorMessages.NO_TOKEN });
            return;
        }

        jwt.verify(token, env.JWT_SECRET!);
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) { 
            res.status(401).json({ message: ErrorMessages.EXPIRED_TOKEN });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: ErrorMessages.INVALID_TOKEN });
            return;
        }

        res.status(500).json({ message: ErrorMessages.INTERNAL_SERVER_ERROR });
    }
}
 
export default authMiddleware;