import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required');
    }

    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: username.trim() },
                { email: email.trim().toLowerCase() },
            ],
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
        });

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        return next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        return res.json({
            token: createToken(user._id),
            username: user.username,
            avatar: user.avatar || 'Bot'
        });
    } catch (err) {
        return next(err);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ error: 'Avatar is required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.avatar = avatar;
        await user.save();

        return res.json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (err) {
        return next(err);
    }
};
