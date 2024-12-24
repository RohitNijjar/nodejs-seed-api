import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDB = async () => {
  try {
    logger.info('Skipping database connection. No database configured yet.');
    // await mongoose.connect(process.env.MONGO_URI!);
    // console.log("MongoDB connected", { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(error);
    }
    process.exit(1);
  }
}