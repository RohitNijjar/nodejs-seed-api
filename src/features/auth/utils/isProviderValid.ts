import { authProvider } from '../constants';

export const isProviderValid = (provider: string): provider is authProvider => {
  return ['email', 'google'].includes(provider as authProvider);
};
