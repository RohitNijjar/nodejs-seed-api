import { ERROR_CODES, HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/errors";
import { AUTH_ERROR_CODES } from "./errorCodes";
import UserModel, { User } from "./models/userModel";

export const AuthRepository = {
    register: async (user: User): Promise<User> => {
        try {
            const newUser = await UserModel.create(user);
            return newUser.save();
        } catch (error) {
            if (error instanceof Error && (error as any).code === 11000) {
                throw new AppError("Auth repository error", AUTH_ERROR_CODES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
            }

            throw new AppError("Auth repository error", ERROR_CODES.INTERNAL_SERVER_ERROR);
        }
    },

    getUserByEmail: async (email: string): Promise<User | null> => {
        return await UserModel.findOne({ email });
    }
};