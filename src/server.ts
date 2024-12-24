import app from './app';
import { connectDB, env, logger } from './config';
import jwt from 'jsonwebtoken';

const startServer = async () => {
    try {
        await connectDB();
        const user = { id: '123', name: 'Rohit Nijjar', email: 'rohit@example.com' };
        const token = jwt.sign(user, env.JWT_SECRET!, { expiresIn: '1h' });
        console.log('New Token:', token);
        
        app.listen(env.PORT, () => {
            logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

startServer();