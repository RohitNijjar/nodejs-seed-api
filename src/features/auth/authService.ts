import { toUserDto, toUserPayload } from './authMappers';
import { AuthRepository } from './authRepository';
import { UserDTO } from './dtos';
import { AUTH_ERROR_CODES } from './errorCodes';
import { LoginRequest, RegisterRequest } from './models/requests';
import { ERROR_CODES, HTTP_STATUS } from '../../shared/constants';
import { ApiError } from '../../shared/errors';
import { comparePassword, hashPassword } from '../../shared/utils/hash';
import { generateToken } from '../../shared/utils/jwt';

export const AuthService = {
  register: async (registerRequest: RegisterRequest): Promise<UserDTO> => {
    const hashedPassword = await hashPassword(registerRequest.password);
    const newUser = await AuthRepository.register({
      ...registerRequest,
      password: hashedPassword,
    });

    return toUserDto(newUser);
  },

  login: async (loginRequest: LoginRequest): Promise<UserDTO> => {
    const user = await AuthRepository.getUserByEmail(loginRequest.email);
    if (!user) {
      throw new ApiError(
        'Auth service error',
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
        'Auth service error',
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (!user.id) {
      throw new ApiError(
        'Auth service error',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }
    const token = generateToken(
      toUserPayload(user.id, user.email, user.isVerified),
    );

    return toUserDto(user, token);
  },
};
