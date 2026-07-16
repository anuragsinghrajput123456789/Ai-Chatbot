import mongoose from 'mongoose';

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required');
    }

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected! Re-attempting connection...');
    });

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of 30s
    });
};
