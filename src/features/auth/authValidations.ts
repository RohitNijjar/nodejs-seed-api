import Joi from 'joi';

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
  isVerified: Joi.boolean().default(false),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});
