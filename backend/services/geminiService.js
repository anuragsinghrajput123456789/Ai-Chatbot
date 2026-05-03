import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        const err = new Error('GEMINI_API_KEY is required');
        err.statusCode = 500;
        throw err;
    }

    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const generateGeminiReply = async ({ messages, message, systemPrompt }) => {
    const recentMessages = messages.slice(-12).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    const promptText = systemPrompt?.trim()
        ? `${systemPrompt.trim()}\n\nUser message: ${message}`
        : message;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
            ...recentMessages,
            { role: 'user', parts: [{ text: promptText }] },
        ],
        config: {
            maxOutputTokens: 4096,
        },
    });

    const reply = response.text?.trim();
    if (!reply) {
        const err = new Error('AI response was empty');
        err.statusCode = 500;
        throw err;
    }

    return reply;
};
