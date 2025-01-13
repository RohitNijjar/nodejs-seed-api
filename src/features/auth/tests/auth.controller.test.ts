import { Request, Response, NextFunction } from 'express';

import { env } from '../../../config';
import { ERROR_CODES } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';

jest.mock('../services/authService.ts');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };

    next = jest.fn();
  });

  describe('register', () => {
    beforeEach(() => {
      req = {
        body: {
          email: 'test@email.com',
          password: 'P@ssword123',
          firstName: 'Test',
          lastName: 'User',
        },
      };
    });

    it('should register a new user and return data with 201 status', async () => {
      const mockNewUser = {
        id: '123',
        email: 'test@email.com',
        firstName: 'Test',
        lastName: 'User',
      };
      (AuthService.register as jest.Mock).mockResolvedValue(mockNewUser);

      await AuthController.register(req as Request, res as Response, next);

      expect(AuthService.register).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'P@ssword123',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: mockNewUser,
        statusCode: 201,
      });
    });

    it('should call next with an error if registration fails', async () => {
      const error = new Error('Registration failed');
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      await AuthController.register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    // setup
    beforeEach(() => {
      req = {
        body: {
          email: 'test@email.com',
          password: 'P@ssword123',
        },
      };
    });

    it('should log in a user and returns data with 200 status', async () => {
      // arrange
      const mockAuthenticateUser = {
        user: {
          id: '123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@email.com',
          isVerified: false,
          token: 'test12!@',
        },
        refreshToken: 'test!@12',
      };
      (AuthService.login as jest.Mock).mockResolvedValue(mockAuthenticateUser);

      // act
      await AuthController.login(req as Request, res as Response, next);

      // assert
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'P@ssword123',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockAuthenticateUser.refreshToken,
        {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockAuthenticateUser.user,
        statusCode: 200,
      });
    });

    it('should call next with an error if login fails', async () => {
      const error = new Error('Login failed');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      await AuthController.login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('verifyEmail', () => {
    // setup
    beforeEach(() => {
      req = {
        body: {
          token: 'testToken',
        },
      };
    });

    it('should verify email and return 200 status with message', async () => {
      // arrange
      const mockMessage = 'Email verified successfully';
      (AuthService.verifyEmail as jest.Mock).mockResolvedValue(mockMessage);

      // act
      await AuthController.verifyEmail(req as Request, res as Response, next);

      // assert
      expect(AuthService.verifyEmail).toHaveBeenCalledWith('testToken');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { message: mockMessage },
        statusCode: 200,
      });
    });

    it('should throw ApiError when no token is provided', async () => {
      // arrange
      req.body = { token: null };
      const apiError = new ApiError(
        'Auth controller error: No token provided',
        ERROR_CODES.NO_TOKEN,
        401,
      );

      // act
      await AuthController.verifyEmail(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(expect.objectContaining(apiError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with an error if verification fails', async () => {
      // arrange
      const error = new Error('Verification failed');
      (AuthService.verifyEmail as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.verifyEmail(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('forgotPassword', () => {
    // setup
    beforeEach(() => {
      req = {
        body: {
          email: 'test@email.com',
        },
      };
    });

    it('should send forgot password email and return 200 status with message', async () => {
      // arrange
      const mockMessage = 'Password reset email sent';
      (AuthService.forgotPassword as jest.Mock).mockResolvedValue(mockMessage);

      // act
      await AuthController.forgotPassword(
        req as Request,
        res as Response,
        next,
      );

      // assert
      expect(AuthService.forgotPassword).toHaveBeenCalledWith('test@email.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { message: mockMessage },
        statusCode: 200,
      });
    });

    it('should call next with an error if forgot password fails', async () => {
      // arrange
      const error = new Error('Forgot password failed');
      (AuthService.forgotPassword as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.forgotPassword(
        req as Request,
        res as Response,
        next,
      );

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('resetPassword', () => {
    // setup
    beforeEach(() => {
      req = {
        body: {
          token: 'testToken',
          oldPassword: 'oldPassword!123',
          newPassword: 'newPassword!123',
          confirmPassword: 'newPassword!123',
        },
      };
    });

    it('should reset password and return 200 status with message', async () => {
      // arrange
      (AuthService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      // act
      await AuthController.resetPassword(req as Request, res as Response, next);

      // assert
      expect(AuthService.resetPassword).toHaveBeenCalledWith({
        token: 'testToken',
        oldPassword: 'oldPassword!123',
        newPassword: 'newPassword!123',
        confirmPassword: 'newPassword!123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { updated: true, message: 'Password updated successfully' },
        statusCode: 200,
      });
    });

    it('should call next with an error if reset password fails', async () => {
      // arrange
      const error = new Error('Reset password failed');
      (AuthService.resetPassword as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.resetPassword(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('sendVerificationEmail', () => {
    // setup
    beforeEach(() => {
      req = {
        body: {
          email: 'test@email.com',
        },
      };
    });

    it('should send verification email and return 200 status with message', async () => {
      // arrange
      const mockMessage = 'Verification email sent successfully';
      (AuthService.sendVerificationEmail as jest.Mock).mockResolvedValue(
        mockMessage,
      );

      // act
      await AuthController.sendVerificationEmail(
        req as Request,
        res as Response,
        next,
      );

      // assert
      expect(AuthService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@email.com',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { message: mockMessage },
        statusCode: 200,
      });
    });

    it('should call next with an error if sending verification email fails', async () => {
      // arrange
      const error = new Error('Send verification email failed');
      (AuthService.sendVerificationEmail as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.sendVerificationEmail(
        req as Request,
        res as Response,
        next,
      );

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    // setup
    beforeEach(() => {
      req = {
        cookies: {
          refreshToken: 'testRefreshToken',
        },
      };
    });

    it('should log out user and return 200 status with message', async () => {
      // arrange
      const mockMessage = 'Logged out successfully';
      (AuthService.logout as jest.Mock).mockResolvedValue(mockMessage);

      // act
      await AuthController.logout(req as Request, res as Response, next);

      // assert
      expect(AuthService.logout).toHaveBeenCalledWith('testRefreshToken');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { message: mockMessage },
        statusCode: 200,
      });
    });

    it('should call next with an error if logout fails', async () => {
      // arrange
      const error = new Error('Logout failed');
      (AuthService.logout as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.logout(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('renewToken', () => {
    // setup
    beforeEach(() => {
      req = {
        cookies: {
          refreshToken: 'testRefreshToken',
        },
      };
    });

    it('should renew token and return 200 status with new token', async () => {
      // arrange
      const mockNewToken = 'newAccessToken';
      (AuthService.renewToken as jest.Mock).mockResolvedValue(mockNewToken);

      // act
      await AuthController.renewToken(req as Request, res as Response, next);

      // assert
      expect(AuthService.renewToken).toHaveBeenCalledWith('testRefreshToken');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { token: mockNewToken },
        statusCode: 200,
      });
    });

    it('should call next with an error if renew token fails', async () => {
      // arrange
      const error = new Error('Renew token failed');
      (AuthService.renewToken as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.renewToken(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('externalLogin', () => {
    // setup
    beforeEach(() => {
      req = {
        query: {
          provider: 'google',
        },
      };
    });

    it('should redirect to external login URL', async () => {
      // arrange
      const mockRedirectUrl = 'https://accounts.google.com/o/oauth2/auth';
      (AuthService.externalLogin as jest.Mock).mockResolvedValue(
        mockRedirectUrl,
      );

      // act
      await AuthController.externalLogin(req as Request, res as Response, next);

      // assert
      expect(AuthService.externalLogin).toHaveBeenCalledWith('google');
      expect(res.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });

    it('should call next with an error if external login fails', async () => {
      // arrange
      const error = new Error('External login failed');
      (AuthService.externalLogin as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.externalLogin(req as Request, res as Response, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('externalLoginCallback', () => {
    // setup
    beforeEach(() => {
      req = {
        query: {
          state: 'google',
          code: 'authCode',
        },
      };
    });

    it('should handle external login callback and return 200 status with user data and refresh token', async () => {
      // arrange
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockRefreshToken = 'mockRefreshToken';
      (AuthService.externalLoginCallback as jest.Mock).mockResolvedValue({
        user: mockUser,
        refreshToken: mockRefreshToken,
      });

      // act
      await AuthController.externalLoginCallback(
        req as Request,
        res as Response,
        next,
      );

      // arrange
      expect(AuthService.externalLoginCallback).toHaveBeenCalledWith(
        'authCode',
        'google',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { user: mockUser, refreshToken: mockRefreshToken },
        statusCode: 200,
      });
    });

    it('should call next with an error if external login callback fails', async () => {
      // arrange
      const error = new Error('External login callback failed');
      (AuthService.externalLoginCallback as jest.Mock).mockRejectedValue(error);

      // act
      await AuthController.externalLoginCallback(
        req as Request,
        res as Response,
        next,
      );

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
