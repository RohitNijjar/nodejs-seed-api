import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/errors";
import { comparePassword, hashPassword } from "../../shared/utils/jwt/hash";
import { generateToken } from "../../shared/utils/jwt/jwt";
import { toUser, toUserPayload } from "./authMappers";
import { AuthRepository } from "./authRepository";
import { AUTH_ERROR_CODES } from "./errorCodes";
import { User } from "./models/userModel";

export const AuthService = {
    register: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<User> => {
        const hashedPassword = await hashPassword(password);

        const newUser = await AuthRepository.register(toUser(email, hashedPassword, firstName, lastName, false));
        return newUser;
    },

    login: async (email: string, password: string): Promise<string> => { 
        const user = await AuthRepository.getUserByEmail(email);
        
        if (!user) {
            throw new AppError("Auth service error", AUTH_ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
        }

        const isPasswordValid = await comparePassword(password);

        if(!isPasswordValid) {
            throw new AppError("Auth service error", AUTH_ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
        }

        return generateToken(toUserPayload(user.id!, user.email, user.isVerified));
    },
};