import mongoose from 'mongoose';

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
};
