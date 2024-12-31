import { NextFunction, Request, Response } from 'express';

import {
  toChangePasswordRequest,
  toLoginRequest,
  toRegisterRequest,
} from './authMappers';
import { AuthService } from './authService';
import { AUTH_ERROR_CODES } from './errorCodes';
import { HTTP_STATUS } from '../../shared/constants';
import { ApiError } from '../../shared/errors';
import { createApiResponse } from '../../shared/utils/responseHandler';

export const AuthController = {
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;
    try {
      const newUser = await AuthService.register(
        toRegisterRequest(email, password, firstName, lastName),
      );

      res.status(HTTP_STATUS.CREATED).json(
        createApiResponse({
          data: newUser,
          statusCode: HTTP_STATUS.CREATED,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  login: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password } = req.body;
    try {
      const user = await AuthService.login(toLoginRequest(email, password));

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: user,
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { token } = req.params;
    try {
      if (!token) {
        throw new ApiError(
          'Auth controller error: No token provided',
          AUTH_ERROR_CODES.NO_TOKEN,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const message = await AuthService.verifyEmail(token as string);

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: { message },
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    try {
      await AuthService.changePassword(
        toChangePasswordRequest(
          email,
          oldPassword,
          newPassword,
          confirmPassword,
        ),
      );

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: {
            updated: true,
            message: 'Password updated successfully',
          },
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};
