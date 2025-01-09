import axios from 'axios';
import jwt from 'jsonwebtoken';

import { env, logger } from '../../../config';
import { ERROR_CODES, HTTP_STATUS } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { AUTH_ERROR_CODES, authProvider } from '../constants';
import { toExternalAuthResponse } from '../mappers/authMappers';
import { GoogleUser } from '../models';
import { ExternalAuthResponse } from '../models/responses/externalAuthResponse';

export const verifyExternalLoginToken = async (
  token: string,
  provider: authProvider,
): Promise<ExternalAuthResponse> => {
  switch (provider) {
    case 'google':
      return await verifyGoogleToken(token);
    default:
      throw new ApiError(
        'Unsupported auth provider',
        AUTH_ERROR_CODES.INVALID_PROVIDER,
        HTTP_STATUS.BAD_REQUEST,
      );
  }
};

const verifyGoogleToken = async (
  token: string,
): Promise<ExternalAuthResponse> => {
  try {
    const tokenResponse = await axios.post(env.GOOGLE_TOKEN_URL, {
      code: token,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { id_token } = tokenResponse.data;

    const decoded = jwt.decode(id_token) as GoogleUser;

    if (!decoded) {
      throw new ApiError(
        'Auth service error: invalid ID token',
        AUTH_ERROR_CODES.INVALID_ID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return toExternalAuthResponse(decoded.email, decoded.name);
  } catch (error) {
    logger.error(error);
    throw new ApiError(
      'Auth service error: Token verification failed',
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
