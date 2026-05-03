import { OpenRouter } from "@openrouter/sdk";

const getOpenRouterClient = () => {
    if (!process.env.OPENROUTER_API_KEY) {
        const err = new Error('OPENROUTER_API_KEY is required');
        err.statusCode = 500;
        throw err;
    }

    return new OpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY
    });
};

export const generateGeminiReply = async ({ messages, message, systemPrompt }) => {
    const recentMessages = messages.slice(-12).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));

    if (systemPrompt?.trim()) {
        recentMessages.unshift({ role: 'system', content: systemPrompt.trim() });
    }

    recentMessages.push({ role: 'user', content: message });

    const ai = getOpenRouterClient();
    
    const stream = await ai.chat.send({
        chatRequest: {
            model: "openrouter/owl-alpha",
            messages: recentMessages,
            stream: false // Using non-streaming for current chatController logic
        }
    });

    const reply = stream?.choices?.[0]?.message?.content?.trim();
    
    if (!reply) {
        const err = new Error('AI response was empty');
        err.statusCode = 500;
        throw err;
    }

    return reply;
};
