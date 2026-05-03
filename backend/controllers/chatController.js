import Chat from '../models/Chat.js';
import { generateGeminiReply } from '../services/geminiService.js';
import { generateOllamaReply, getOllamaModels } from '../services/ollamaService.js';

export const getChatHistory = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.json([]);
        }

        const chat = await Chat.findOne({ userId: req.user.id });
        return res.json(chat?.messages || []);
    } catch (err) {
        return next(err);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { message, systemPrompt, mode = 'online', modelName } = req.body;
        const cleanMessage = message?.trim();

        if (!cleanMessage) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (mode === 'offline' && !modelName) {
            return res.status(400).json({ error: 'Model name is required in offline mode' });
        }

        let chat = null;
        const historyMessages = [];

        if (req.user?.id) {
            chat = await Chat.findOne({ userId: req.user.id });
            if (!chat) {
                chat = new Chat({ userId: req.user.id, messages: [] });
            }
            historyMessages.push(...chat.messages);
        }

        let botReply = '';

        if (mode === 'offline') {
            try {
                const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser message: ${cleanMessage}` : cleanMessage;
                botReply = await generateOllamaReply({
                    model: modelName,
                    prompt: fullPrompt,
                    stream: false,
                });
            } catch (err) {
                if (err.statusCode === 503 || err.message.includes('locally')) {
                    return res.status(503).json({ error: 'Ollama is not running. Please start Ollama locally.' });
                }
                if (err.statusCode === 404 || err.message.includes('not installed')) {
                    return res.status(404).json({ error: `Model is not installed. Please install it with: ollama pull ${modelName}` });
                }
                return res.status(500).json({ error: 'Failed to generate response from Ollama' });
            }
        } else {
            botReply = await generateGeminiReply({
                messages: historyMessages,
                message: cleanMessage,
                systemPrompt,
            });
        }

        if (chat) {
            chat.messages.push({ role: 'user', text: cleanMessage });
            chat.messages.push({ role: 'model', text: botReply });
            await chat.save();
        }

        return res.json({
            reply: botReply,
            messages: chat?.messages,
        });
    } catch (err) {
        return next(err);
    }
};

export const getOllamaModelsList = async (req, res, next) => {
    try {
        const models = await getOllamaModels();
        return res.json(models);
    } catch (err) {
        if (err.statusCode === 503 || err.message.includes('locally')) {
            return res.status(503).json({ error: 'Ollama is not running.' });
        }
        return next(err);
    }
};

export const updateChatMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const cleanText = text?.trim();

        if (!cleanText) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const chat = await Chat.findOne({ userId: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat history not found' });
        }

        const message = chat.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        message.text = cleanText;
        await chat.save();

        return res.json({ message, messages: chat.messages });
    } catch (err) {
        return next(err);
    }
};

export const deleteChatMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const chat = await Chat.findOne({ userId: req.user.id });

        if (!chat) {
            return res.status(404).json({ error: 'Chat history not found' });
        }

        const message = chat.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        message.deleteOne();
        await chat.save();

        return res.json({ message: 'Message deleted successfully', messages: chat.messages });
    } catch (err) {
        return next(err);
    }
};

export const deleteChatHistory = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.json({ message: 'Guest chat cleared locally' });
        }

        await Chat.findOneAndDelete({ userId: req.user.id });
        return res.json({ message: 'Chat history deleted successfully' });
    } catch (err) {
        return next(err);
    }
};
