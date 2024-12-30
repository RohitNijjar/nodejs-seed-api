import { NextFunction, Request, Response } from 'express';

import { toLoginRequest, toRegisterRequest } from './authMappers';
import { AuthService } from './authService';
import { HTTP_STATUS } from '../../shared/constants';
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
};
