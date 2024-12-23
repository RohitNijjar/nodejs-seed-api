import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log('Skipping database connection. No database configured yet.');
    // await mongoose.connect(process.env.MONGO_URI!);
    // console.log("MongoDB connected", { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}