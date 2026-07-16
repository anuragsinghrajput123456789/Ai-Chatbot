import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required');
    }

    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const cleanUsername = username?.trim();
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanUsername || !cleanEmail || !password?.trim()) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (cleanUsername.length < 3 || cleanUsername.length > 30) {
            return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, or hyphens' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ error: 'Invalid email address format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: cleanUsername },
                { email: cleanEmail },
            ],
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username: cleanUsername,
            email: cleanEmail,
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
            avatar: user.avatar || 'Bot',
            email: user.email,
            onlineUseCount: user.onlineUseCount || 0
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
