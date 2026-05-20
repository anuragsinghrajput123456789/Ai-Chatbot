export const errorHandler = (err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin is not allowed by CORS' });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation failed', details: err.message });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid format for field: ${err.path}` });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Authentication token has expired' });
    }

    if (err.code === 11000) {
        return res.status(409).json({ error: 'Duplicate value already exists' });
    }

    const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

    return res.status(statusCode).json({
        error: statusCode === 500 ? 'Server error' : err.message,
        ...(process.env.NODE_ENV === 'production' ? {} : { details: err.details || err.message }),
    });
};
