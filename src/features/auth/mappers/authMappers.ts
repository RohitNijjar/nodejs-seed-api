import { UserPayload } from '../../../shared/models';
import { UserDTO } from '../dtos';
import {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/requests';
import { User } from '../models/userModel';

export const toRegisterRequest = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): RegisterRequest => ({
  email,
  password,
  firstName,
  lastName,
});

export const toLoginRequest = (
  email: string,
  password: string,
): LoginRequest => ({
  email,
  password,
});

export const toResetPasswordRequest = (
  token: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
): ResetPasswordRequest => ({
  token,
  oldPassword,
  newPassword,
  confirmPassword,
});

export const toUser = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isVerified: boolean,
): User => ({
  email,
  password,
  firstName,
  lastName,
  isVerified,
});

export const toUserPayload = (
  userId: string,
  email: string,
  purpose?: string,
): UserPayload => ({
  userId,
  email,
  purpose,
});

export const toUserDto = (user: User, token?: string): UserDTO => ({
  id: user.id ?? '',
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isVerified: user.isVerified,
  token: token,
});
