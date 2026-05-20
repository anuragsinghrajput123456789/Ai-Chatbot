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
        const status = err.statusCode || 503;
        if (status === 503 || err.message.includes('locally') || err.message.includes('start Ollama')) {
            return res.status(503).json({ models: [], error: 'Ollama is not running. Start it with: ollama serve' });
        }
        return next(err);
    }
};
