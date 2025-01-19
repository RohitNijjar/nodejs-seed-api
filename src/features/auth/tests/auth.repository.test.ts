import { MongoServerError } from 'mongodb';

import { ERROR_CODES, HTTP_STATUS } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { AUTH_ERROR_CODES, authProvider } from '../constants';
import { UserModel } from '../models';
import { AuthRepository } from '../repositories/authRepository';
import { splitName } from '../utils';

jest.mock('../models/userModel.ts', () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));
jest.mock('../utils');

describe('AuthRepository', () => {
  describe('register', () => {
    // arrange
    const mockUser = {
      _id: '12345',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      provider: 'email',
      isVerified: false,
    };

    it('should create and save a new user successfully', async () => {
      // arrange
      const registerRequest = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'test',
      };
      const savedUser = { id: '1', ...registerRequest, save: jest.fn() };
      (UserModel.create as jest.Mock).mockResolvedValue(savedUser);
      savedUser.save.mockResolvedValue(mockUser);

      // act
      const result = await AuthRepository.register(registerRequest);

      // assert
      expect(UserModel.create).toHaveBeenCalledWith(registerRequest);
      expect(savedUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user already exists', async () => {
      // arrange
      const registerRequest = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'test',
      };
      const error = new MongoServerError({ code: 11000 });
      (UserModel.create as jest.Mock).mockRejectedValue(error);

      // assert
      await expect(AuthRepository.register(registerRequest)).rejects.toThrow(
        new ApiError(
          'Auth repository error: User with this email already exists',
          AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
          HTTP_STATUS.CONFLICT,
        ),
      );
    });

    it('should throw a server error for other errors', async () => {
      // arrange
      const registerRequest = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'test',
      };
      const error = new Error('Server error');
      (UserModel.create as jest.Mock).mockRejectedValue(error);

      // assert
      await expect(AuthRepository.register(registerRequest)).rejects.toThrow(
        new ApiError(
          'Auth repository error: Server error',
          ERROR_CODES.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      // arrange
      const email = 'test@example.com';
      const user = { id: '1', email };
      (UserModel.findOne as jest.Mock).mockResolvedValue(user);

      // act
      const result = await AuthRepository.getUserByEmail(email);

      // assert
      expect(UserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      // arrange
      const email = 'test@example.com';
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      // act
      const result = await AuthRepository.getUserByEmail(email);

      // assert
      expect(UserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      // arrange
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        provider: 'test' as authProvider,
        isVerified: true,
      };
      (UserModel.updateOne as jest.Mock).mockResolvedValue({});

      // act
      await AuthRepository.updateUser(user);

      // assert
      expect(UserModel.updateOne).toHaveBeenCalledWith({ _id: user.id }, user);
    });
  });

  describe('findOrCreateUser', () => {
    it('should find an existing user', async () => {
      // arrange
      const email = 'test@example.com';
      const name = 'Test User';
      const provider = 'google';
      const user = {
        id: '1',
        email,
        firstName: 'Test',
        lastName: 'User',
        provider,
        isVerified: true,
      };
      (splitName as jest.Mock).mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
      });
      (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(user);

      // act
      const result = await AuthRepository.findOrCreateUser(
        email,
        name,
        provider,
      );

      // assert
      expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email },
        {
          $setOnInsert: {
            firstName: 'Test',
            lastName: 'User',
            email,
            provider,
            isVerified: true,
          },
        },
        { new: true, upsert: true },
      );
      expect(result).toEqual(user);
    });
  });
});
