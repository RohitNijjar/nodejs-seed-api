import { MongoServerError } from 'mongodb';

import { AUTH_ERROR_CODES } from './errorCodes';
import { RegisterRequest } from './models/requests';
import { User, UserModel } from './models/userModel';
import { ERROR_CODES, HTTP_STATUS } from '../../shared/constants';
import { ApiError } from '../../shared/errors';

export const AuthRepository = {
  register: async (registerRequest: RegisterRequest): Promise<User> => {
    try {
      const newUser = await UserModel.create(registerRequest);
      return newUser.save();
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ApiError(
          'Auth repository error: User with this email already exists',
          AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
          HTTP_STATUS.CONFLICT,
        );
      }

      throw new ApiError(
        'Auth repository error: Server error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    return await UserModel.findOne({ email });
  },

  updateUser: async (user: User): Promise<void> => {
    await UserModel.updateOne({ _id: user.id }, user);
  },
};
