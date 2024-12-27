import app from './app';
import { connectDB, env, logger } from './config';

const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(env.PORT, () => {
            logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

startServer();