import { getOllamaModels, getOllamaStatus } from '../services/ollamaService.js';

export const getStatus = async (req, res, next) => {
    try {
        await getOllamaStatus();
        return res.json({ running: true });
    } catch (err) {
        return res.status(err.statusCode || 503).json({
            running: false,
            error: err.message,
        });
    }
};

export const getModels = async (req, res, next) => {
    try {
        const models = await getOllamaModels();
        return res.json({ models });
    } catch (err) {
        return next(err);
    }
};
