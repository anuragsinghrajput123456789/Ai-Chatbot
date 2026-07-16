import 'dotenv/config'; // MUST be first: loads env vars before any module reads process.env
import mongoose from 'mongoose';

import app from './app.js';
import { connectDB } from './config/db.js';


process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

try {
    console.log('Connecting to MongoDB...');
    await connectDB();
} catch (err) {
    console.error('CRITICAL: Database connection failed. Shutting down...', err.message);
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
        process.exit(1);
    });
});

const gracefulShutdown = () => {
    console.log('👋 Shutting down gracefully...');
    server.close(() => {
        console.log('💥 HTTP server closed.');
        mongoose.connection.close(false).then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
