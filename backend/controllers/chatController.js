import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { generateGeminiReply } from '../services/geminiService.js';
import { generateOllamaReply, getOllamaModels } from '../services/ollamaService.js';

export const getChatList = async (req, res, next) => {
    try {
        if (!req.user?.id) return res.json([]);
        const chats = await Chat.find({ userId: req.user.id })
            .select('_id title updatedAt')
            .sort({ updatedAt: -1 });
        return res.json(chats);
    } catch (err) {
        return next(err);
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        if (!req.user?.id) return res.json([]);
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
        return res.json(chat?.messages || []);
    } catch (err) {
        return next(err);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { message, systemPrompt, mode = 'online', modelName, chatId } = req.body;
        const cleanMessage = message?.trim();

        if (!cleanMessage) return res.status(400).json({ error: 'Message is required' });
        if (mode === 'offline' && !modelName) return res.status(400).json({ error: 'Model name is required in offline mode' });

        let chat = null;
        const historyMessages = [];
        let user = null;

        if (req.user?.id) {
            user = await User.findById(req.user.id);
            // If token is valid but user was deleted from DB, treat as guest
            if (!user) {
                req.user = null;
            } else {
                if (chatId && /^[a-f\d]{24}$/i.test(chatId)) {
                    chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
                }
                if (!chat) {
                    chat = new Chat({ 
                        userId: req.user.id, 
                        title: cleanMessage.length > 30 ? cleanMessage.substring(0, 30) + '...' : cleanMessage,
                        messages: [] 
                    });
                }
                historyMessages.push(...chat.messages);
            }
        }



        let botReply = '';

        if (mode === 'offline') {
            try {
                // Build a structured, context-aware prompt with history memory for the offline Ollama model
                let fullPrompt = "";
                if (systemPrompt) {
                    fullPrompt += `${systemPrompt}\n\n`;
                }
                
                if (historyMessages && historyMessages.length > 0) {
                    historyMessages.forEach(msg => {
                        const speaker = msg.role === 'user' ? 'User' : 'Assistant';
                        fullPrompt += `${speaker}: ${msg.text}\n`;
                    });
                }
                
                fullPrompt += `User: ${cleanMessage}\nAssistant:`;

                botReply = await generateOllamaReply({ model: modelName, prompt: fullPrompt, stream: false });
            } catch (err) {
                if (err.statusCode === 503 || err.message.includes('locally')) return res.status(503).json({ error: 'Ollama is not running. Please start Ollama locally.' });
                if (err.statusCode === 404 || err.message.includes('not installed')) return res.status(404).json({ error: `Model is not installed. Please install it with: ollama pull ${modelName}` });
                return res.status(500).json({ error: 'Failed to generate response from Ollama' });
            }
        } else {
            try {
                botReply = await generateGeminiReply({ messages: historyMessages, message: cleanMessage, systemPrompt });
            } catch (err) {
                if (err.statusCode === 503) return res.status(503).json({ error: 'AI service is temporarily unavailable. Please try again.' });
                if (err.statusCode === 502) return res.status(502).json({ error: 'AI returned an empty response. Please retry.' });
                return res.status(err.statusCode || 500).json({ error: err.message || 'Failed to generate AI response' });
            }
        }

        if (chat) {
            chat.messages.push({ role: 'user', text: cleanMessage });
            chat.messages.push({ role: 'model', text: botReply });
            await chat.save();
        }

        // Increment onlineUseCount for authenticated users in online mode
        let updatedOnlineUseCount = user ? (user.onlineUseCount || 0) : 0;
        if (user && mode === 'online') {
            try {
                await User.findByIdAndUpdate(user._id, { $inc: { onlineUseCount: 1 } });
                updatedOnlineUseCount = (user.onlineUseCount || 0) + 1;
            } catch {
                // Non-critical: don't fail the request if count update fails
            }
        }

        return res.json({ 
            reply: botReply, 
            messages: chat?.messages, 
            chatId: chat?._id,
            onlineUseCount: updatedOnlineUseCount
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
        if (err.statusCode === 503 || err.message.includes('locally')) return res.status(503).json({ error: 'Ollama is not running.' });
        return next(err);
    }
};

export const updateChatMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const cleanText = text?.trim();

        if (!cleanText) return res.status(400).json({ error: 'Message text is required' });

        const chat = await Chat.findOne({ userId: req.user.id, "messages._id": messageId });
        if (!chat) return res.status(404).json({ error: 'Message not found' });

        const message = chat.messages.id(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

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
        const chat = await Chat.findOne({ userId: req.user.id, "messages._id": messageId });
        if (!chat) return res.status(404).json({ error: 'Message not found' });

        const message = chat.messages.id(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        message.deleteOne();
        await chat.save();

        return res.json({ message: 'Message deleted successfully', messages: chat.messages });
    } catch (err) {
        return next(err);
    }
};

export const renameChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

        const chat = await Chat.findOneAndUpdate({ _id: chatId, userId: req.user.id }, { title: title.trim() }, { new: true });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        return res.json({ message: 'Chat renamed successfully', chat: { _id: chat._id, title: chat.title } });
    } catch (err) {
        return next(err);
    }
};

export const deleteChatHistory = async (req, res, next) => {
    try {
        if (!req.user?.id) return res.json({ message: 'Guest chat cleared locally' });
        const { chatId } = req.params;
        
        if (chatId) {
            await Chat.findOneAndDelete({ _id: chatId, userId: req.user.id });
            return res.json({ message: 'Chat history deleted successfully' });
        } else {
            // Fallback to delete all for user if no chatId
            await Chat.deleteMany({ userId: req.user.id });
            return res.json({ message: 'All chat histories deleted successfully' });
        }
    } catch (err) {
        return next(err);
    }
};
