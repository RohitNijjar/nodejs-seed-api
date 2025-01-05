import { NextFunction, Request, Response } from 'express';

import { env } from '../../../config';
import { ERROR_CODES, HTTP_STATUS } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { createApiResponse } from '../../../shared/utils/responseHandler';
import {
  toResetPasswordRequest,
  toLoginRequest,
  toRegisterRequest,
} from '../mappers/authMappers';
import { AuthService } from '../services/authService';

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
      const { user, refreshToken } = await AuthService.login(
        toLoginRequest(email, password),
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

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
    const { token } = req.body;
    try {
      if (!token) {
        throw new ApiError(
          'Auth controller error: No token provided',
          ERROR_CODES.NO_TOKEN,
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

  forgotPassword: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email } = req.body;

    try {
      const message = await AuthService.forgotPassword(email);

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: {
            message,
          },
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { token, oldPassword, newPassword, confirmPassword } = req.body;

    try {
      await AuthService.resetPassword(
        toResetPasswordRequest(
          token,
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

  sendVerificationEmail: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email } = req.body;

    try {
      await AuthService.sendVerificationEmail(email);

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: {
            message: 'Verification email sent successfully',
          },
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  logout: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new ApiError(
          'Auth controller error: No refresh token',
          ERROR_CODES.NO_REFRESH_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      await AuthService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(HTTP_STATUS.OK).json(
        createApiResponse({
          data: {
            message: 'Logged out successfully',
          },
          statusCode: HTTP_STATUS.OK,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};
