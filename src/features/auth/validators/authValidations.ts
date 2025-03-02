import Joi from 'joi';

import { validProviders } from '../constants';

/**
 * @swagger
 * components:
 *  schemas:
 *   RegisterRequest:
 *    type: object
 *    required:
 *      - email
 *      - password
 *      - firstName
 *      - lastName
 *    properties:
 *      email:
 *        type: string
 *        default: testuser@email.com
 *      password:
 *        type: string
 *        default: Test1234!
 *      firstName:
 *        type: string
 *        default: Test
 *      lastName:
 *        type: string
 *        default: User
 *   CreateUserResponse:
 *    type: object
 *    properties:
 *      data:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          email:
 *            type: string
 *          isVerified:
 *            type: boolean
 *      statusCode:
 *        type: number
 */
export const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must have at least one uppercase letter, one lowercase letter, one number and one special character',
    }),
  firstName: Joi.string().required().messages({
    'string.empty': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last name is required',
  }),
});

/**
 * @swagger
 * components:
 *  schemas:
 *   LoginRequest:
 *    type: object
 *    required:
 *      - email
 *      - password
 *    properties:
 *      email:
 *        type: string
 *        default: testuser@email.com
 *      password:
 *        type: string
 *        default: Test1234!
 *   AuthenticatedUserResponse:
 *    type: object
 *    properties:
 *      data:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          email:
 *            type: string
 *          isVerified:
 *            type: boolean
 *          token:
 *            type: string
 *      statusCode:
 *        type: number
 */
export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Old password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base':
        'New password must have at least one uppercase letter, one lowercase letter, one number and one special character',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords do not match',
    }),
});

export const sendVerificationEmailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
});

export const externalLoginValidation = Joi.object({
  provider: Joi.string()
    .valid(...validProviders)
    .required()
    .messages({
      'any.only': 'Invalid provider',
      'string.empty': 'Provider is required',
    }),
});
