import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'Bot' },
    onlineUseCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);