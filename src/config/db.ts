import mongoose from 'mongoose';

import { env } from './env';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI!);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(error);
    }
    process.exit(1);
  }
};
