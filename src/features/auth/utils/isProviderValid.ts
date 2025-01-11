import { authProvider, validProviders } from '../constants';

export const isProviderValid = (provider: string): provider is authProvider => {
  return validProviders.includes(provider as authProvider);
};
