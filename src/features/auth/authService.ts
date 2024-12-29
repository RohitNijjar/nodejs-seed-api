import { ERROR_CODES, HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/errors";
import { comparePassword, hashPassword } from "../../shared/utils/jwt/hash";
import { generateToken } from "../../shared/utils/jwt/jwt";
import { toUser, toUserDto, toUserPayload } from "./authMappers";
import { AuthRepository } from "./authRepository";
import { UserDTO } from "./dtos/userDto";
import { AUTH_ERROR_CODES } from "./errorCodes";
import { User } from "./models/userModel";

export const AuthService = {
    register: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<UserDTO> => {
        const hashedPassword = await hashPassword(password);
        const newUser = await AuthRepository.register(toUser(email, hashedPassword, firstName, lastName, false));
        
        return toUserDto(newUser);
    },

    login: async (email: string, password: string): Promise<UserDTO> => { 
        const user = await AuthRepository.getUserByEmail(email);
        if (!user) {
            throw new AppError("Auth service error", AUTH_ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if(!isPasswordValid) {
            throw new AppError("Auth service error", AUTH_ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
        }

        if (!user.id) {
            throw new AppError("Auth service error", ERROR_CODES.INTERNAL_SERVER_ERROR);
        }
        const token = generateToken(toUserPayload(user.id, user.email, user.isVerified));

        return toUserDto(user, token);
    },
};