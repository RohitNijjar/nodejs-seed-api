import { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../../../shared/constants';

export const UserController = {
  test: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as Request & { user: { email: string } }).user;
      res.status(HTTP_STATUS.OK).json({
        data: `Congrats ${user.email}! you have accessed a secured resource`,
      });
    } catch (error) {
      next(error);
    }
  },
};
