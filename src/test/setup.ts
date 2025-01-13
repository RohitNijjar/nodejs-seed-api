import { logger } from '../config';

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  throw error;
});

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('../shared/redis/redisClient.ts', () => {
  const mockRedisClient = {
    get: jest.fn(),
    setex: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  };

  return {
    redisClient: mockRedisClient,
    closeRedisConnection: jest.fn(() => Promise.resolve()),
    getRedisValueAsync: jest.fn(() => Promise.resolve('mockValue')),
    setRedisKeyAsync: jest.fn(() => Promise.resolve('OK')),
  };
});
