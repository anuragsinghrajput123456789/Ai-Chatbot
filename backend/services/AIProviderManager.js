import { generateGeminiReply, generateGeminiReplyStream } from './geminiService.js';

/**
 * AI Provider Manager (Backend)
 * 
 * Routes requests to correct providers based on Online/Offline mode.
 * delegates online mode entirely to Gemini / OpenRouter fallback.
 * offline mode is delegated entirely to the client-side OfflineModelManager.
 */
export const AIProviderManager = {
    generateReply: async ({ messages, message, systemPrompt, mode, model }) => {
        if (mode === 'offline') {
            const err = new Error('Offline mode must be handled entirely client-side. The backend must never communicate with localhost or Ollama.');
            err.statusCode = 400;
            throw err;
        }

        // Online Mode -> Gemini -> OpenRouter fallback
        return await generateGeminiReply({ messages, message, systemPrompt, model });
    },

    generateReplyStream: async ({ messages, message, systemPrompt, mode, model, onChunk, signal }) => {
        if (mode === 'offline') {
            const err = new Error('Offline mode must be handled entirely client-side. The backend must never communicate with localhost or Ollama.');
            err.statusCode = 400;
            throw err;
        }

        // Online Mode -> Gemini -> OpenRouter fallback streaming
        return await generateGeminiReplyStream({ messages, message, systemPrompt, model, onChunk, signal });
    }
};
