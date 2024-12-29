import { env } from "../../../config";
import * as jwt from 'jsonwebtoken';
import { UserPayload } from "../../models";

export const generateToken = (payload: UserPayload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, env.JWT_SECRET);
};