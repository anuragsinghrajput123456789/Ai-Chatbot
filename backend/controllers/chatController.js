import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import { retrieveRelevantChunks } from '../services/ragService.js';
import { AIProviderManager } from '../services/AIProviderManager.js';

export const getChatList = async (req, res, next) => {
    try {
        if (!req.user?.id) return res.json([]);
        const chats = await Chat.find({ userId: req.user.id })
            .select('_id title updatedAt workspaceId isArchived isFavorite')
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
        if (!/^[a-f\d]{24}$/i.test(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID format' });
        }
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
        return res.json(chat?.messages || []);
    } catch (err) {
        return next(err);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { message, systemPrompt, mode = 'online', modelName, chatId, workspaceId, stream = false } = req.body;
        const cleanMessage = message?.trim();

        if (!cleanMessage) return res.status(400).json({ error: 'Message is required' });
        if (cleanMessage.length > 10000) return res.status(400).json({ error: 'Message cannot exceed 10,000 characters' });
        if (mode === 'offline') return res.status(400).json({ error: 'Offline mode is handled client-side. Do not send offline requests to the backend.' });

        if (chatId && !/^[a-f\d]{24}$/i.test(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID format' });
        }

        let chat = null;
        const historyMessages = [];
        let user = null;

        if (req.user?.id) {
            user = await User.findById(req.user.id);
            // If token is valid but user was deleted from DB, treat as guest
            if (!user) {
                req.user = null;
            } else {
                if (chatId) {
                    chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
                }
                if (!chat) {
                    chat = new Chat({ 
                        userId: req.user.id, 
                        workspaceId: workspaceId || null,
                        title: cleanMessage.length > 30 ? cleanMessage.substring(0, 30) + '...' : cleanMessage,
                        messages: [] 
                     });
                }
                historyMessages.push(...chat.messages.slice(-24));
            }
        }

        // Retrieve Document Context for Grounding if documents exist
        let matchingChunks = [];
        let enhancedSystemPrompt = (systemPrompt || '').trim();

        if (req.user?.id) {
            const docQuery = { userId: req.user.id };
            if (chatId) {
                docQuery.chatId = chatId;
            } else {
                docQuery.chatId = null;
            }

            const documents = await Document.find(docQuery);
            if (documents.length > 0) {
                console.log(`RAG Grounding: Found ${documents.length} attached documents. Retrieving chunks...`);
                matchingChunks = await retrieveRelevantChunks({
                    query: cleanMessage,
                    documents,
                    mode: 'online', // Send message API is only used in online mode
                    limit: 4
                });

                if (matchingChunks.length > 0) {
                    const contextText = matchingChunks.map((c, i) => `[Source ${i+1}: ${c.docName} (Confidence: ${(c.score * 100).toFixed(0)}%)]\n${c.text}`).join('\n\n');
                    enhancedSystemPrompt = `${enhancedSystemPrompt}\n\n[Grounded Document Context]\nYou have access to the following documents for answering the user's question. Ground your answer strictly in this context. Use inline citations like [Source 1], [Source 2], etc. where applicable. If the context does not contain the answer, rely on your general knowledge but explicitly state that the documents were insufficient.\n\n${contextText}`.trim();
                }
            }
        }

        // Setup AbortController bound to client request disconnect
        const controller = new AbortController();
        req.on('close', () => {
            controller.abort();
        });

        let botReply = '';

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Send citations metadata to frontend immediately
            if (matchingChunks.length > 0) {
                res.write(`data: ${JSON.stringify({
                    citations: matchingChunks.map(c => ({
                        docName: c.docName,
                        text: c.text,
                        score: c.score,
                        index: c.index
                    }))
                })}\n\n`);
            }

            try {
                await AIProviderManager.generateReplyStream({ 
                    messages: historyMessages, 
                    message: cleanMessage, 
                    systemPrompt: enhancedSystemPrompt, 
                    mode,
                    model: modelName,
                    onChunk: (chunk) => {
                        botReply += chunk;
                        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
                    },
                    signal: controller.signal
                });
            } catch (err) {
                if (err.name === 'AbortError') {
                    // Client closed stream
                } else {
                    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
                }
                res.write("data: [DONE]\n\n");
                res.end();
                return;
            }

            if (chat && botReply.trim()) {
                chat.messages.push({ role: 'user', text: cleanMessage });
                chat.messages.push({ role: 'model', text: botReply });
                await chat.save();
            }

            // Increment onlineUseCount for authenticated users in online mode
            let updatedOnlineUseCount = user ? (user.onlineUseCount || 0) : 0;
            if (user && mode === 'online' && botReply.trim()) {
                try {
                    const updatedUser = await User.findByIdAndUpdate(
                        user._id,
                        { $inc: { onlineUseCount: 1 } },
                        { new: true }
                    );
                    updatedOnlineUseCount = updatedUser?.onlineUseCount ?? updatedOnlineUseCount + 1;
                } catch {
                    // Non-critical: don't fail the request if count update fails
                }
            }

            res.write(`data: ${JSON.stringify({
                metadata: {
                    chatId: chat?._id,
                    onlineUseCount: updatedOnlineUseCount,
                    messages: chat?.messages
                }
            })}\n\n`);

            res.write("data: [DONE]\n\n");
            res.end();
            return;
        }

        // Legacy Batch Flow
        try {
            botReply = await AIProviderManager.generateReply({ messages: historyMessages, message: cleanMessage, systemPrompt: enhancedSystemPrompt, mode, model: modelName });
        } catch (err) {
            if (err.statusCode === 503) return res.status(503).json({ error: 'AI service is temporarily unavailable. Please try again.' });
            if (err.statusCode === 502) return res.status(502).json({ error: 'AI returned an empty response. Please retry.' });
            return res.status(err.statusCode || 500).json({ error: err.message || 'Failed to generate AI response' });
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
                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    { $inc: { onlineUseCount: 1 } },
                    { new: true }
                );
                updatedOnlineUseCount = updatedUser?.onlineUseCount ?? updatedOnlineUseCount + 1;
            } catch {
                // Non-critical: don't fail the request if count update fails
            }
        }

        return res.json({ 
            reply: botReply, 
            messages: chat?.messages, 
            chatId: chat?._id,
            onlineUseCount: updatedOnlineUseCount,
            citations: matchingChunks.map(c => ({
                docName: c.docName,
                text: c.text,
                score: c.score,
                index: c.index
            }))
        });
    } catch (err) {
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
        if (!/^[a-f\d]{24}$/i.test(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID format' });
        }
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
            if (!/^[a-f\d]{24}$/i.test(chatId)) {
                return res.status(400).json({ error: 'Invalid chat ID format' });
            }
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

export const searchChats = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 5, startDate, endDate, workspaceId } = req.query;
        const userId = req.user.id;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 5;
        const skipNum = (pageNum - 1) * limitNum;

        const query = { userId };

        if (workspaceId) {
            if (workspaceId === "unassigned" || workspaceId === "null") {
                query.workspaceId = null;
            } else {
                query.workspaceId = workspaceId;
            }
        }

        if (q?.trim()) {
            query.$text = { $search: q };
        }

        if (startDate || endDate) {
            query.updatedAt = {};
            if (startDate) {
                query.updatedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.updatedAt.$lte = new Date(endDate);
            }
        }

        const total = await Chat.countDocuments(query);

        let chatsQuery = Chat.find(query);
        if (q?.trim()) {
            chatsQuery = chatsQuery
                .select({ score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            chatsQuery = chatsQuery.sort({ updatedAt: -1 });
        }

        const chats = await chatsQuery.skip(skipNum).limit(limitNum);

        const results = chats.map(chat => {
            const matches = [];
            let titleMatch = false;

            if (q?.trim()) {
                const searchTerms = q.toLowerCase().split(/\s+/).filter(Boolean);
                
                if (chat.title && searchTerms.some(term => chat.title.toLowerCase().includes(term))) {
                    titleMatch = true;
                }

                chat.messages.forEach(msg => {
                    const text = msg.text || "";
                    const textLower = text.toLowerCase();
                    const matchedTerm = searchTerms.find(term => textLower.includes(term));
                    
                    if (matchedTerm) {
                        const index = textLower.indexOf(matchedTerm);
                        const start = Math.max(0, index - 60);
                        const end = Math.min(text.length, index + 60);
                        let snippet = text.substring(start, end);
                        if (start > 0) snippet = "..." + snippet;
                        if (end < text.length) snippet = snippet + "...";

                        matches.push({
                            role: msg.role,
                            snippet,
                            timestamp: msg.timestamp
                        });
                    }
                });
            }

            return {
                chatId: chat._id,
                title: chat.title,
                updatedAt: chat.updatedAt,
                workspaceId: chat.workspaceId,
                isArchived: chat.isArchived,
                isFavorite: chat.isFavorite,
                titleMatch,
                matches: matches.slice(0, 3)
            };
        });

        return res.json({
            results,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        return next(err);
    }
};

export const moveChatToWorkspace = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { workspaceId } = req.body;
        
        if (workspaceId && !/^[a-f\d]{24}$/i.test(workspaceId)) {
            return res.status(400).json({ error: 'Invalid workspace ID format' });
        }

        const chat = await Chat.findOneAndUpdate(
            { _id: chatId, userId: req.user.id },
            { $set: { workspaceId: workspaceId || null } },
            { new: true }
        );

        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        return res.json({ message: 'Chat moved successfully', chat });
    } catch (err) {
        return next(err);
    }
};

export const duplicateChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const originalChat = await Chat.findOne({ _id: chatId, userId: req.user.id });
        if (!originalChat) return res.status(404).json({ error: 'Chat not found' });

        const clonedChat = new Chat({
            userId: req.user.id,
            workspaceId: originalChat.workspaceId,
            title: `${originalChat.title} (Copy)`,
            messages: originalChat.messages.map(m => ({
                role: m.role,
                text: m.text,
                timestamp: m.timestamp
            })),
            isFavorite: false,
            isArchived: false
        });

        await clonedChat.save();
        return res.status(201).json(clonedChat);
    } catch (err) {
        return next(err);
    }
};

export const toggleFavoriteChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        chat.isFavorite = !chat.isFavorite;
        await chat.save();

        return res.json({ message: chat.isFavorite ? 'Added to favorites' : 'Removed from favorites', chat });
    } catch (err) {
        return next(err);
    }
};

export const toggleArchiveChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        chat.isArchived = !chat.isArchived;
        await chat.save();

        return res.json({ message: chat.isArchived ? 'Chat archived' : 'Chat unarchived', chat });
    } catch (err) {
        return next(err);
    }
};

export const exportChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ userId: req.user.id });
        return res.json({ chats });
    } catch (err) {
        return next(err);
    }
};

export const importChats = async (req, res, next) => {
    try {
        const { chats } = req.body;
        if (!chats || !Array.isArray(chats)) {
            return res.status(400).json({ error: 'Invalid payload: chats array is required.' });
        }

        const restoredChats = [];
        for (const chatData of chats) {
            const chat = new Chat({
                userId: req.user.id,
                workspaceId: chatData.workspaceId || null,
                title: chatData.title || 'Restored Chat',
                messages: chatData.messages || [],
                isFavorite: chatData.isFavorite || false,
                isArchived: chatData.isArchived || false
            });
            await chat.save();
            restoredChats.push(chat);
        }

        return res.json({ success: true, count: restoredChats.length });
    } catch (err) {
        return next(err);
    }
};
