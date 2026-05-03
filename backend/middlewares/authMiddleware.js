import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication token is required' });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is required'));
    }

    try {
        req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is required'));
    }

    try {
        req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
        req.user = null;
    }

    return next();
};
