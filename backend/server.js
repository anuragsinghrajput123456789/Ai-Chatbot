import dotenv from 'dotenv';
import mongoose from 'mongoose';

import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

connectDB().catch((err) => {
    console.error('Database connection failed:', err.message);
});

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
