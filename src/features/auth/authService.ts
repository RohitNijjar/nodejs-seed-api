import { toUserDto, toUserPayload } from './authMappers';
import { AuthRepository } from './authRepository';
import { UserDTO } from './dtos';
import { emailVerificationTemplate } from './emailTemplates';
import { AUTH_ERROR_CODES } from './errorCodes';
import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from './models/requests';
import { env } from '../../config';
import { ERROR_CODES, HTTP_STATUS } from '../../shared/constants';
import { ApiError } from '../../shared/errors';
import { comparePassword, hashPassword } from '../../shared/utils/hash';
import {
  generateEmailVerificationToken,
  generateToken,
  verifyEmailVerificationToken,
} from '../../shared/utils/jwt';
import { sendEmail } from '../../shared/utils/sendEmail';

export const AuthService = {
  register: async (registerRequest: RegisterRequest): Promise<UserDTO> => {
    const hashedPassword = await hashPassword(registerRequest.password);
    const newUser = await AuthRepository.register({
      ...registerRequest,
      password: hashedPassword,
    });

    if (!newUser.id) {
      throw new ApiError(
        'Auth service error: Server error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    const token = generateEmailVerificationToken(
      toUserPayload(newUser.id!, newUser.email, 'emailVerification'),
    );
    const verificationUrl = `${env.CLIENT_URL}/${token}`;
    const emailHtml = emailVerificationTemplate(verificationUrl);

    await sendEmail({
      from: env.ADMIN_EMAIL!,
      to: newUser.email,
      subject: 'Verify Your Email',
      html: emailHtml,
    });

    return toUserDto(newUser);
  },

  login: async (loginRequest: LoginRequest): Promise<UserDTO> => {
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

    return toUserDto(user, token);
  },

  verifyEmail: async (token: string): Promise<string> => {
    const payload = verifyEmailVerificationToken(token);
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

  changePassword: async (
    changePasswordRequest: ChangePasswordRequest,
  ): Promise<void> => {
    const user = await AuthRepository.getUserByEmail(
      changePasswordRequest.email,
    );

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

    const isPasswordValid = await comparePassword(
      changePasswordRequest.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(
        'Auth service error: Old password is incorrect',
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const hashedPassword = await hashPassword(
      changePasswordRequest.newPassword,
    );
    user.password = hashedPassword;
    await AuthRepository.updateUser(user);
  },
};
