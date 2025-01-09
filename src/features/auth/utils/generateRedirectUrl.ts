import { env } from '../../../config';
import { HTTP_STATUS } from '../../../shared/constants';
import { ApiError } from '../../../shared/errors';
import { AUTH_ERROR_CODES, authProvider } from '../constants';

export const generateRedirectURL = (provider: authProvider): string => {
  switch (provider) {
    case 'google':
      return `${env.GOOGLE_OAUTH_URL}?response_type=code&state=${provider}&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${env.GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
    default:
      throw new ApiError(
        'Auth service error: invalid provider',
        AUTH_ERROR_CODES.INVALID_PROVIDER,
        HTTP_STATUS.BAD_REQUEST,
      );
  }
};
