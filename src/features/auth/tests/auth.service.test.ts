import { env } from '../../../config';
import {
  BLACKLIST_PREFIX,
  ERROR_CODES,
  HTTP_STATUS,
} from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { setRedisKeyAsync } from '../../../shared/redis/redisClient';
import { sendEmail } from '../../../shared/utils/email';
import {
  comparePassword,
  hashPassword,
} from '../../../shared/utils/hashing/hash';
import {
  generateToken,
  isTokenBlacklisted,
  verifyToken,
} from '../../../shared/utils/JWT/jwt';
import { AUTH_ERROR_CODES, authProvider } from '../constants';
import { toUserDto, toUserPayload } from '../mappers/authMappers';
import { AuthRepository } from '../repositories/authRepository';
import { AuthService } from '../services/authService';
import { emailVerificationTemplate } from '../templates/emailTemplates';
import { generateRedirectURL, verifyExternalLoginToken } from '../utils';

jest.mock('../../../config', () => ({
  env: {
    REFRESH_TOKEN_SECRET: 'mock-refresh-token-secret',
    REFRESH_TOKEN_EXPIRATION: '1d',
    EMAIL_JWT_SECRET: 'mock-email-jwt-secret',
    RESET_PASSWORD_JWT_SECRET: 'mock-password-jwt-secret',
    RESET_PASSWORD_JWT_EXPIRATION: '5m',
    CLIENT_URL: 'https://app.test.com',
    ADMIN_EMAIL: 'admin@email.com',
    REFRESH_TOKEN_EXPIRATION_BLACKLIST: '604800',
    JWT_SECRET: 'mock_jwt_secret',
  },
}));
jest.mock('../../../shared/constants/jwt.ts', () => ({
  BLACKLIST_PREFIX: 'test',
}));
jest.mock('../../../shared/utils/hashing/hash.ts');
jest.mock('../../../shared/utils/JWT/jwt.ts');
jest.mock('../repositories/authRepository.ts');
jest.mock('../mappers/authMappers.ts');
jest.mock('../templates/emailTemplates');
jest.mock('../../../shared/utils/email');
jest.mock('../../../shared/redis/redisClient');
jest.mock('../utils');

describe('Auth Service', () => {
  const mockUser = {
    id: '1',
    email: 'test@email.com',
    password: 'HashedP@ssword123',
    firstName: 'Test',
    lastName: 'User',
    provider: 'email',
    isVerified: false,
  };

  describe('sendVerificationEmail', () => {
    // setup
    const mockEmail = 'test@email.com';
    const mockToken = 'mockToken123';
    const mockVerificationUrl = `${env.CLIENT_URL}/verify-email?token=${mockToken}`;
    const mockUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'emailVerification',
    };
    const mockEmailTemplate = '<h3>test</h3>';

    it('should send verification email', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (toUserPayload as jest.Mock).mockReturnValue(mockUserPayload);
      (generateToken as jest.Mock).mockReturnValue(mockToken);
      (emailVerificationTemplate as jest.Mock).mockReturnValue(
        mockEmailTemplate,
      );
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      // act
      await AuthService.sendVerificationEmail(mockEmail);

      // assert
      expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(generateToken).toHaveBeenCalledWith(
        mockUserPayload,
        env.EMAIL_JWT_SECRET,
        env.EMAIL_JWT_EXPIRATION,
      );
      expect(emailVerificationTemplate).toHaveBeenCalledWith(
        mockVerificationUrl,
      );
      expect(sendEmail).toHaveBeenCalledWith({
        from: env.ADMIN_EMAIL,
        to: mockUser.email,
        subject: 'Verify Your Email',
        html: mockEmailTemplate,
      });
    });

    it('should throw an ApiError if the user not found', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      // assert
      await expect(
        AuthService.sendVerificationEmail(mockEmail),
      ).rejects.toThrow(
        new ApiError(
          'Auth service error: User not found',
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        ),
      );

      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user id is not available', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: null,
      });

      //assert
      await expect(
        AuthService.sendVerificationEmail(mockEmail),
      ).rejects.toThrow(
        new ApiError(
          'Auth service error: Server error',
          ERROR_CODES.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    // setup
    const mockRegisterRequest = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@email.com',
      password: 'P@ssword123',
    };

    const mockUserDTO = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@email.com',
      isVerified: false,
    };

    it('should register a new user and returns UserDTO', async () => {
      // arrange
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (AuthRepository.register as jest.Mock).mockResolvedValue(mockUser);
      AuthService.sendVerificationEmail = jest
        .fn()
        .mockResolvedValue(undefined);
      (toUserDto as jest.Mock).mockReturnValue(mockUserDTO);

      // act
      const result = await AuthService.register(mockRegisterRequest);

      // assert
      expect(hashPassword).toHaveBeenCalledWith(mockRegisterRequest.password);
      expect(AuthRepository.register).toHaveBeenCalledWith({
        ...mockRegisterRequest,
        password: 'hashedPassword123',
      });
      expect(AuthService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(result).toEqual(mockUserDTO);
    });

    it('should throw an error if password hashing fails', async () => {
      // arrange
      (hashPassword as jest.Mock).mockRejectedValue(
        new Error('Hashing failed'),
      );

      // assert
      await expect(AuthService.register(mockRegisterRequest)).rejects.toThrow(
        'Hashing failed',
      );
      expect(AuthRepository.register).not.toHaveBeenCalled();
      expect(AuthService.sendVerificationEmail).not.toHaveBeenCalled();
      expect(toUserDto).not.toHaveBeenCalled();
    });

    it('should throw an error if user registration fails', async () => {
      // arrange
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (AuthRepository.register as jest.Mock).mockRejectedValue(
        new Error('Registration failed'),
      );

      // assert
      await expect(AuthService.register(mockRegisterRequest)).rejects.toThrow(
        'Registration failed',
      );
      expect(AuthService.sendVerificationEmail).not.toHaveBeenCalled();
      expect(toUserDto).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    // setup
    const mockLoginRequest = {
      email: 'test@email.com',
      password: 'P@ssword123',
    };

    const mockTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'test',
    };

    const mockRefreshTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'test',
    };

    const mockUserDTO = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@email.com',
      isVerified: false,
      token: 'jwtToken123',
    };

    it('should login a user and returns userDTO and a refreshToken', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (toUserPayload as jest.Mock).mockReturnValueOnce(mockTokenUserPayload);
      (generateToken as jest.Mock).mockReturnValueOnce('jwtToken123');
      (toUserPayload as jest.Mock).mockReturnValueOnce(
        mockRefreshTokenUserPayload,
      );
      (generateToken as jest.Mock).mockReturnValueOnce('jwtRefreshToken123');
      (toUserDto as jest.Mock).mockReturnValue(mockUserDTO);

      // act
      const result = await AuthService.login(mockLoginRequest);

      // assert
      expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith(
        mockLoginRequest.email,
      );
      expect(comparePassword).toHaveBeenCalledWith(
        mockLoginRequest.password,
        mockUser.password,
      );
      expect(generateToken).toHaveBeenNthCalledWith(1, mockTokenUserPayload);
      expect(generateToken).toHaveBeenNthCalledWith(
        2,
        mockRefreshTokenUserPayload,
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_EXPIRATION,
      );
      expect(result).toEqual({
        user: mockUserDTO,
        refreshToken: 'jwtRefreshToken123',
      });
    });

    it('should thrown an ApiError if user was not returned', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      // assert
      await expect(AuthService.login(mockLoginRequest)).rejects.toThrow(
        new ApiError(
          'Auth service error: Email is incorrect',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
      expect(comparePassword as jest.Mock).not.toHaveBeenCalled();
      expect(generateToken as jest.Mock).not.toHaveBeenCalled();
      expect(toUserDto as jest.Mock).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if password is incorrect', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockReturnValue(false);

      //assert
      await expect(AuthService.login(mockLoginRequest)).rejects.toThrow(
        new ApiError(
          'Auth service error: Password is incorrect',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
      expect(generateToken as jest.Mock).not.toHaveBeenCalled();
      expect(toUserDto as jest.Mock).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user id is not available', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: null,
      });
      (comparePassword as jest.Mock).mockReturnValue(true);

      //assert
      await expect(AuthService.login(mockLoginRequest)).rejects.toThrow(
        new ApiError(
          'Auth service error: Server error',
          ERROR_CODES.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(generateToken as jest.Mock).not.toHaveBeenCalled();
      expect(toUserDto as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    // setup
    const mockToken = 'mockToken123';

    const mockTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'emailVerification',
    };

    it('should verify email and return success message', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockTokenUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (AuthRepository.updateUser as jest.Mock).mockResolvedValue(undefined);

      // act
      const result = await AuthService.verifyEmail(mockToken);

      // assert
      expect(verifyToken).toHaveBeenCalledWith(mockToken, env.EMAIL_JWT_SECRET);
      expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith(
        mockTokenUserPayload.email,
      );
      expect(AuthRepository.updateUser).toHaveBeenCalledWith({
        ...mockUser,
        isVerified: true,
      });
      expect(result).toBe('Email verified successfully');
    });

    it('should throw an error if the token is invalid', async () => {
      // arrange
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        );
      });

      // assert
      await expect(AuthService.verifyEmail(mockToken)).rejects.toThrow(
        new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      expect(AuthRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user was not found', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockTokenUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(undefined);

      // assert
      await expect(AuthService.verifyEmail(mockToken)).rejects.toThrow(
        new ApiError(
          'Auth service error: User not found',
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        ),
      );
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user is already verified', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockTokenUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });

      // assert
      await expect(AuthService.verifyEmail(mockToken)).rejects.toThrow(
        new ApiError(
          'Auth service error: User already verified',
          AUTH_ERROR_CODES.USER_ALREADY_VERIFIED,
          HTTP_STATUS.FORBIDDEN,
        ),
      );
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    // setup
    const mockEmail = 'test@email.com';
    const mockToken = 'mockToken123';
    const mockResetPasswordUrl = `${env.CLIENT_URL}/reset-password?token=${mockToken}`;
    const mockEmailTemplate = '<h3>test</h3>';
    const mockTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'test',
    };

    it('should send forgot password email and return message', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });
      (toUserPayload as jest.Mock).mockReturnValue(mockTokenUserPayload);
      (generateToken as jest.Mock).mockReturnValue(mockToken);
      (emailVerificationTemplate as jest.Mock).mockReturnValue(
        mockEmailTemplate,
      );
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      // act
      const result = await AuthService.forgotPassword(mockEmail);

      // assert
      expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(generateToken).toHaveBeenCalledWith(
        mockTokenUserPayload,
        env.RESET_PASSWORD_JWT_SECRET,
        env.RESET_PASSWORD_JWT_EXPIRATION,
      );
      expect(emailVerificationTemplate).toHaveBeenCalledWith(
        mockResetPasswordUrl,
      );
      expect(sendEmail).toHaveBeenCalledWith({
        from: env.ADMIN_EMAIL!,
        to: mockUser.email,
        subject: 'Reset Your Password',
        html: mockEmailTemplate,
      });
      expect(result).toBe('Reset password email sent successfully');
    });

    it('should throw an ApiError if user was not found', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(undefined);

      // assert
      await expect(AuthService.forgotPassword(mockToken)).rejects.toThrow(
        new ApiError(
          'Auth service error: User not found',
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        ),
      );
      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if provider is not email', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        provider: 'google',
      });

      // assert
      await expect(AuthService.forgotPassword(mockToken)).rejects.toThrow(
        new ApiError(
          'Auth service error: Not registered using email',
          AUTH_ERROR_CODES.USER_NOT_REGISTERED_WITH_EMAIL,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
        ),
      );
      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user was not verified', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: false,
      });

      // assert
      await expect(AuthService.forgotPassword(mockToken)).rejects.toThrow(
        new ApiError(
          'Auth service error: User is not verified',
          AUTH_ERROR_CODES.USER_NOT_VERIFIED,
          HTTP_STATUS.FORBIDDEN,
        ),
      );
      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if user id is not available', async () => {
      // arrange
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
        id: null,
      });

      //assert
      await expect(AuthService.forgotPassword(mockEmail)).rejects.toThrow(
        new ApiError(
          'Auth service error: Server error',
          ERROR_CODES.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(generateToken).not.toHaveBeenCalled();
      expect(emailVerificationTemplate).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    // setup
    const mockResetPasswordRequest = {
      token: 'mockToken123',
      oldPassword: 'P@ssword123',
      newPassword: 'P@ssword321',
      confirmPassword: 'P@ssword321',
    };

    const mockUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'emailVerification',
    };

    const mockHashedPassword = 'mockHashedPassword123';

    it('should reset password and update user', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);
      (AuthRepository.updateUser as jest.Mock).mockResolvedValue(undefined);

      // act
      await AuthService.resetPassword(mockResetPasswordRequest);

      // assert
      expect(verifyToken).toHaveBeenCalledWith(
        mockResetPasswordRequest.token,
        env.RESET_PASSWORD_JWT_SECRET,
      );
      expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith(
        mockUserPayload.email,
      );
      expect(comparePassword).toHaveBeenCalledWith(
        mockResetPasswordRequest.oldPassword,
        mockUser.password,
      );
      expect(hashPassword).toHaveBeenCalledWith(
        mockResetPasswordRequest.newPassword,
      );
      expect(AuthRepository.updateUser).toHaveBeenCalledWith({
        ...mockUser,
        isVerified: true,
        password: mockHashedPassword,
      });
    });

    it('should throw an ApiError if the token is invalid', async () => {
      // arrange
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        );
      });

      // assert
      await expect(
        AuthService.resetPassword(mockResetPasswordRequest),
      ).rejects.toThrow(
        new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      expect(AuthRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(comparePassword).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if the user not found', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(undefined);

      // assert
      await expect(
        AuthService.resetPassword(mockResetPasswordRequest),
      ).rejects.toThrow(
        new ApiError(
          'Auth service error: User not found',
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        ),
      );

      expect(comparePassword).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if the old password is incorrect', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // assert
      await expect(
        AuthService.resetPassword(mockResetPasswordRequest),
      ).rejects.toThrow(
        new ApiError(
          'Auth service error: Old password is incorrect',
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      expect(hashPassword).not.toHaveBeenCalled();
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if password hashing fails', async () => {
      // arrange
      (verifyToken as jest.Mock).mockReturnValue(mockUserPayload);
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockRejectedValue(
        new Error('Hashing failed'),
      );

      // assert
      await expect(
        AuthService.resetPassword(mockResetPasswordRequest),
      ).rejects.toThrow('Hashing failed');
      expect(AuthRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    // arrange
    const mockRefreshToken = 'mockRefreshToken123';
    const mockTokenKey = `${BLACKLIST_PREFIX}${mockRefreshToken}`;
    const mockExpiration = Number(env.REFRESH_TOKEN_EXPIRATION_BLACKLIST);

    it('should blacklist the refresh token', async () => {
      // arrange
      (setRedisKeyAsync as jest.Mock).mockResolvedValue('OK');

      // act
      await AuthService.logout(mockRefreshToken);

      // assert
      expect(setRedisKeyAsync).toHaveBeenCalledWith(
        mockTokenKey,
        mockExpiration,
        'blacklisted',
      );
    });

    it('should throw an error if `setRedisKeyAsync` fails', async () => {
      // arrange
      (setRedisKeyAsync as jest.Mock).mockRejectedValue(
        new Error('Redis error'),
      );

      // act
      await expect(AuthService.logout(mockRefreshToken)).rejects.toThrow(
        'Redis error',
      );

      // assert
      expect(setRedisKeyAsync).toHaveBeenCalledWith(
        mockTokenKey,
        mockExpiration,
        'blacklisted',
      );
    });
  });

  describe('renewToken', () => {
    // arrange
    const mockRefreshToken = 'mockRefreshToken123';
    const mockUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'test',
    };

    it('should generate a new token', async () => {
      // arrange
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(false);
      (verifyToken as jest.Mock).mockReturnValue(mockUserPayload);
      (toUserPayload as jest.Mock).mockReturnValue(mockUserPayload);
      (generateToken as jest.Mock).mockReturnValue('mockNewToken');

      // act
      const result = await AuthService.renewToken(mockRefreshToken);

      // assert
      expect(isTokenBlacklisted).toHaveBeenCalledWith(mockRefreshToken);
      expect(verifyToken).toHaveBeenCalledWith(
        mockRefreshToken,
        env.REFRESH_TOKEN_SECRET,
      );
      expect(generateToken).toHaveBeenCalledWith(
        mockUserPayload,
        env.JWT_SECRET,
      );
      expect(result).toBe('mockNewToken');
    });

    it('should throw ApiError if refresh token is blacklisted', async () => {
      // arrange
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      // assert
      await expect(AuthService.renewToken).rejects.toThrow(
        new ApiError(
          'Auth service error: Invalid refresh token',
          ERROR_CODES.INVALID_REFRESH_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      expect(verifyToken).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should throw an ApiError if the token is invalid', async () => {
      // arrange
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(false);
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        );
      });

      // assert
      await expect(AuthService.renewToken(mockRefreshToken)).rejects.toThrow(
        new ApiError(
          'JWT error: Invalid token',
          ERROR_CODES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      expect(generateToken).not.toHaveBeenCalled();
    });
  });

  describe('externalLogin', () => {
    it('should generate a redirect url using a provider', () => {
      // arrange
      const mockProvider = 'google';
      const mockRedirectURL = 'test';

      (generateRedirectURL as jest.Mock).mockReturnValue(mockRedirectURL);

      // act
      const result = AuthService.externalLogin(mockProvider);

      // assert
      expect(generateRedirectURL).toHaveBeenCalledWith(mockProvider);
      expect(result).toBe(mockRedirectURL);
    });

    it('should throw an ApiError for an invalid provider', async () => {
      // arrange
      const mockProvider = 'test';
      (generateRedirectURL as jest.Mock).mockImplementation(() => {
        throw new ApiError(
          'Auth service error: invalid provider',
          AUTH_ERROR_CODES.INVALID_PROVIDER,
          HTTP_STATUS.BAD_REQUEST,
        );
      });

      // assert
      expect(() =>
        AuthService.externalLogin(mockProvider as authProvider),
      ).toThrow(
        new ApiError(
          'Auth service error: invalid provider',
          AUTH_ERROR_CODES.INVALID_PROVIDER,
          HTTP_STATUS.BAD_REQUEST,
        ),
      );

      expect(generateRedirectURL).toHaveBeenCalledWith(mockProvider);
    });
  });

  describe('externalLoginCallback', () => {
    // arrange
    const mockCode = 'code123';
    const mockProvider = 'google';
    const mockAuthResponse = {
      userEmail: 'test@email.com',
      name: 'Test User',
    };
    const mockTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'access',
    };
    const mockRefreshTokenUserPayload = {
      userId: '1',
      email: 'test@email.com',
      purpose: 'renewal',
    };
    const mockUserDTO = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@email.com',
      isVerified: 'true',
      token: 'jwtToken123',
    };

    it('should login a user and returns userDTO and a refreshToken', async () => {
      // arrange
      (verifyExternalLoginToken as jest.Mock).mockResolvedValue(
        mockAuthResponse,
      );
      (AuthRepository.findOrCreateUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        provider: mockProvider,
        isVerified: true,
      });
      (toUserPayload as jest.Mock).mockReturnValueOnce(mockTokenUserPayload);
      (generateToken as jest.Mock).mockReturnValueOnce('jwtToken123');
      (toUserPayload as jest.Mock).mockReturnValueOnce(
        mockRefreshTokenUserPayload,
      );
      (generateToken as jest.Mock).mockReturnValueOnce('jwtRefreshToken123');
      (toUserDto as jest.Mock).mockReturnValue(mockUserDTO);

      // act
      const result = await AuthService.externalLoginCallback(
        mockCode,
        mockProvider,
      );

      // assert
      expect(verifyExternalLoginToken).toHaveBeenCalledWith(
        mockCode,
        mockProvider,
      );
      expect(AuthRepository.findOrCreateUser).toHaveBeenCalledWith(
        mockAuthResponse.userEmail,
        mockAuthResponse.name,
        mockProvider,
      );
      expect(generateToken).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: mockUserDTO,
        refreshToken: 'jwtRefreshToken123',
      });
    });

    it('should throw an ApiError if user id is not available', async () => {
      // arrange
      (verifyExternalLoginToken as jest.Mock).mockResolvedValue(
        mockAuthResponse,
      );
      (AuthRepository.findOrCreateUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: null,
      });

      //assert
      await expect(
        AuthService.externalLoginCallback(mockCode, mockProvider),
      ).rejects.toThrow(
        new ApiError(
          'Auth service error: User was not created or fetched',
          ERROR_CODES.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(generateToken as jest.Mock).not.toHaveBeenCalled();
      expect(toUserDto as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
