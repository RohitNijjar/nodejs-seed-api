import mongoose from "mongoose";
import { logger } from "./logger";
import { env } from "./env";

export const connectDB = async () => {
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
}