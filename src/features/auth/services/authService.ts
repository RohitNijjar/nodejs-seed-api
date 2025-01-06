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
import { UserDTO } from '../dtos';
import { AUTH_ERROR_CODES } from '../errors/errorCodes';
import { toUserDto, toUserPayload } from '../mappers/authMappers';
import {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/requests';
import { AuthRepository } from '../repositories/authRepository';
import { emailVerificationTemplate } from '../templates/emailTemplates';

export const AuthService = {
  register: async (registerRequest: RegisterRequest): Promise<UserDTO> => {
    const hashedPassword = await hashPassword(registerRequest.password);
    const newUser = await AuthRepository.register({
      ...registerRequest,
      password: hashedPassword,
    });

    await AuthService.sendVerificationEmail(newUser.email);

    return toUserDto(newUser);
  },

  login: async (
    loginRequest: LoginRequest,
  ): Promise<{ user: UserDTO; refreshToken: string }> => {
    const user = await AuthRepository.getUserByEmail(loginRequest.email);
    if (!user) {
      throw new ApiError(
        'Auth service error: Email is incorrect',
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await comparePassword(
      loginRequest.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(
        'Auth service error: Password is incorrect',
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (!user.id) {
      throw new ApiError(
        'Auth service error: Server error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }
    const token = generateToken(toUserPayload(user.id, user.email, 'access'));
    const refreshToken = generateToken(
      toUserPayload(user.id, user.email, 'renewal'),
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_EXPIRATION,
    );

    return { user: toUserDto(user, token), refreshToken };
  },

  verifyEmail: async (token: string): Promise<string> => {
    const payload = verifyToken(token, env.EMAIL_JWT_SECRET);
    const user = await AuthRepository.getUserByEmail(payload.email);

    if (!user) {
      throw new ApiError(
        'Auth service error: User not found',
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (user.isVerified) {
      throw new ApiError(
        'Auth service error: User already verified',
        AUTH_ERROR_CODES.USER_ALREADY_VERIFIED,
        HTTP_STATUS.CONFLICT,
      );
    }

    user.isVerified = true;
    await AuthRepository.updateUser(user);

    return 'Email verified successfully';
  },

  forgotPassword: async (email: string): Promise<string> => {
    const user = await AuthRepository.getUserByEmail(email);

    if (!user) {
      throw new ApiError(
        'Auth service error: User not found',
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!user.isVerified) {
      throw new ApiError(
        'Auth service error: User is not verified',
        AUTH_ERROR_CODES.USER_NOT_VERIFIED,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (!user.id) {
      throw new ApiError(
        'Auth service error: Server error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    const token = generateToken(
      toUserPayload(user.id, user.email, 'resetPassword'),
      env.RESET_PASSWORD_JWT_SECRET,
      env.RESET_PASSWORD_JWT_EXPIRATION,
    );
    const resetPasswordUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    const emailHtml = emailVerificationTemplate(resetPasswordUrl);

    await sendEmail({
      from: env.ADMIN_EMAIL!,
      to: user.email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    return 'Reset password email sent successfully';
  },

  resetPassword: async (
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> => {
    const userPayload = verifyToken(
      resetPasswordRequest.token,
      env.RESET_PASSWORD_JWT_SECRET,
    );
    const user = await AuthRepository.getUserByEmail(userPayload.email);

    if (!user) {
      throw new ApiError(
        'Auth service error: User not found',
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const isPasswordValid = await comparePassword(
      resetPasswordRequest.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(
        'Auth service error: Old password is incorrect',
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const hashedPassword = await hashPassword(resetPasswordRequest.newPassword);
    user.password = hashedPassword;
    await AuthRepository.updateUser(user);
  },

  sendVerificationEmail: async (email: string): Promise<void> => {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) {
      throw new ApiError(
        'Auth service error: User not found',
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!user.id) {
      throw new ApiError(
        'Auth service error: Server error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    const token = generateToken(
      toUserPayload(user.id, user.email, 'emailVerification'),
      env.EMAIL_JWT_SECRET,
      env.EMAIL_JWT_EXPIRATION,
    );
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    const emailHtml = emailVerificationTemplate(verificationUrl);

    await sendEmail({
      from: env.ADMIN_EMAIL!,
      to: user.email,
      subject: 'Verify Your Email',
      html: emailHtml,
    });
  },

  logout: async (refreshToken: string): Promise<void> => {
    const tokenKey = `${BLACKLIST_PREFIX}${refreshToken}`;
    const expiration = Number(env.REFRESH_TOKEN_EXPIRATION_BLACKLIST);
    await setRedisKeyAsync(tokenKey, expiration, 'blacklisted');
  },

  renewToken: async (refreshToken: string): Promise<string> => {
    const isBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new ApiError(
        'Auth service error: Invalid refresh token',
        ERROR_CODES.INVALID_REFRESH_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const user = verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);

    const newToken = generateToken(
      {
        userId: user.userId,
        email: user.email,
        purpose: 'access',
      },
      env.JWT_SECRET,
    );

    return newToken;
  },
};
