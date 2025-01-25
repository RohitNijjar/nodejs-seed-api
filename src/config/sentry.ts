import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { SentryConfig } from '../shared/models';

export const initSentry = (config: SentryConfig): void => {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    debug: config.debug,
  });
};
