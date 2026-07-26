const callNativeGemini = async ({ messages, message, systemPrompt, model }) => {
    const contents = messages.slice(-12).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    const body = {
        contents,
        generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7
        }
    };

    if (systemPrompt?.trim()) {
        body.systemInstruction = {
            parts: [{ text: systemPrompt.trim() }]
        };
    }

    const selectedModel = model || "gemini-2.5-flash";
    const fallbackModel = selectedModel.includes("pro") ? "gemini-1.5-pro" : "gemini-1.5-flash";

    try {
        console.log(`Native Gemini: Sending request to model "${selectedModel}"...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30000)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (err) {
        console.warn(`Native ${selectedModel} failed, attempting fallback to ${fallbackModel}...`, err.message);
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30000)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        } catch (fallbackErr) {
            console.error("All Native Gemini AI fallbacks failed:", fallbackErr.message);
            const finalErr = new Error(`AI Service Unavailable: ${fallbackErr.message}`);
            finalErr.statusCode = 503;
            throw finalErr;
        }
    }
};

export const generateGeminiReply = async ({ messages, message, systemPrompt, model }) => {
    let reply = "";
    let useOpenRouter = false;
    let primaryModel = model || "google/gemini-2.5-flash";

    if (process.env.OPENROUTER_API_KEY) {
        if (!model || model.includes('/') || !process.env.GEMINI_API_KEY) {
            useOpenRouter = true;
            if (model && !model.includes('/')) {
                primaryModel = `google/${model}`;
            } else if (model) {
                primaryModel = model;
            } else {
                primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
            }
        }
    }

    // If OpenRouter API key is configured, try OpenRouter first
    if (useOpenRouter) {
        const recentMessages = messages.slice(-12).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        if (systemPrompt?.trim()) {
            recentMessages.unshift({ role: 'system', content: systemPrompt.trim() });
        }

        recentMessages.push({ role: 'user', content: message });

        const backupModel = primaryModel.includes("pro") ? "google/gemini-1.5-pro" : "google/gemini-2.5-flash-lite";

        try {
            console.log(`OpenRouter: Sending request to primary model "${primaryModel}"...`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                    "X-OpenRouter-Title": "Chatterbot AI"
                },
                body: JSON.stringify({
                    model: primaryModel,
                    messages: recentMessages,
                    max_tokens: 1500,
                    temperature: 0.7
                }),
                signal: AbortSignal.timeout(30000)
            });

            const data = await response.json();
            
            if (!response.ok) {
                const errReason = data.error?.message || (typeof data.error === 'string' ? data.error : null) || `HTTP ${response.status}`;
                throw new Error(`[Status ${response.status}] ${errReason}`);
            }

            reply = data.choices?.[0]?.message?.content?.trim() || "";
        } catch (err) {
            console.warn(`Primary model failed, attempting fallback to "${backupModel}"... Reason:`, err.message);
            
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                        "X-OpenRouter-Title": "Chatterbot AI"
                    },
                    body: JSON.stringify({
                        model: backupModel,
                        messages: recentMessages,
                        max_tokens: 1500,
                        temperature: 0.7
                    }),
                    signal: AbortSignal.timeout(30000)
                });

                const data = await response.json();

                if (!response.ok) {
                    const errReason = data.error?.message || (typeof data.error === 'string' ? data.error : null) || `HTTP ${response.status}`;
                    throw new Error(`[Status ${response.status}] ${errReason}`);
                }

                reply = data.choices?.[0]?.message?.content?.trim() || "";
            } catch (fallbackErr) {
                console.warn("All OpenRouter AI routes failed:", fallbackErr.message);
                
                // If OpenRouter completely fails, try native Gemini direct fallback
                if (process.env.GEMINI_API_KEY) {
                    console.log("Attempting direct Native Gemini API fallback...");
                    try {
                        const nativeModelName = primaryModel.startsWith("google/") ? primaryModel.replace("google/", "") : primaryModel;
                        return await callNativeGemini({ messages, message, systemPrompt, model: nativeModelName });
                    } catch (nativeErr) {
                        throw nativeErr;
                    }
                }

                const finalErr = new Error(`AI Service Unavailable: ${fallbackErr.message}`);
                finalErr.statusCode = 503;
                throw finalErr;
            }
        }
    } else if (process.env.GEMINI_API_KEY) {
        // If only native Gemini API key is configured, use it directly
        console.log("No OpenRouter API key found or requested native Gemini model directly...");
        return await callNativeGemini({ messages, message, systemPrompt, model });
    } else {
        const err = new Error('Either OPENROUTER_API_KEY or GEMINI_API_KEY environment variable is required');
        err.statusCode = 500;
        throw err;
    }

    if (!reply) {
        const err = new Error('AI response was empty');
        err.statusCode = 502;
        throw err;
    }

    return reply;
};

// =========================================
// STREAMING IMPLEMENTATION
// =========================================

// Stream helper for SSE stream parsing
const parseStream = async (response, onChunk, parserFn, signal) => {
    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of response.body) {
        if (signal?.aborted) {
            throw new DOMException("Request aborted", "AbortError");
        }
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === "[DONE]") continue;
                try {
                    const parsed = JSON.parse(dataStr);
                    const text = parserFn(parsed);
                    if (text) onChunk(text);
                } catch (e) {}
            } else {
                try {
                    const parsed = JSON.parse(trimmed);
                    const text = parserFn(parsed);
                    if (text) onChunk(text);
                } catch (e) {}
            }
        }
    }

    if (buffer.trim()) {
        const trimmed = buffer.trim();
        let dataStr = trimmed;
        if (trimmed.startsWith("data: ")) {
            dataStr = trimmed.slice(6).trim();
        }
        if (dataStr !== "[DONE]") {
            try {
                const parsed = JSON.parse(dataStr);
                const text = parserFn(parsed);
                if (text) onChunk(text);
            } catch (e) {}
        }
    }
};

const streamNativeGemini = async ({ messages, message, systemPrompt, model, onChunk, signal }) => {
    const contents = messages.slice(-12).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    const body = {
        contents,
        generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7
        }
    };

    if (systemPrompt?.trim()) {
        body.systemInstruction = {
            parts: [{ text: systemPrompt.trim() }]
        };
    }

    const geminiParser = (parsed) => parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const selectedModel = model || "gemini-2.5-flash";
    const fallbackModel = selectedModel.includes("pro") ? "gemini-1.5-pro" : "gemini-1.5-flash";

    try {
        console.log(`Native Gemini Stream: Sending request to model "${selectedModel}"...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }

        await parseStream(response, onChunk, geminiParser, signal);
    } catch (err) {
        if (err.name === "AbortError") throw err;
        console.warn(`Native ${selectedModel} stream failed, attempting fallback to ${fallbackModel}...`, err.message);
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }

            await parseStream(response, onChunk, geminiParser, signal);
        } catch (fallbackErr) {
            if (fallbackErr.name === "AbortError") throw fallbackErr;
            console.error("All Native Gemini AI streaming fallbacks failed:", fallbackErr.message);
            throw fallbackErr;
        }
    }
};

export const generateGeminiReplyStream = async ({ messages, message, systemPrompt, model, onChunk, signal }) => {
    let useOpenRouter = false;
    let primaryModel = model || "google/gemini-2.5-flash";

    if (process.env.OPENROUTER_API_KEY) {
        if (!model || model.includes('/') || !process.env.GEMINI_API_KEY) {
            useOpenRouter = true;
            if (model && !model.includes('/')) {
                primaryModel = `google/${model}`;
            } else if (model) {
                primaryModel = model;
            } else {
                primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
            }
        }
    }

    if (useOpenRouter) {
        const recentMessages = messages.slice(-12).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        if (systemPrompt?.trim()) {
            recentMessages.unshift({ role: 'system', content: systemPrompt.trim() });
        }

        recentMessages.push({ role: 'user', content: message });

        const backupModel = primaryModel.includes("pro") ? "google/gemini-1.5-pro" : "google/gemini-2.5-flash-lite";
        
        const openRouterParser = (parsed) => parsed.choices?.[0]?.delta?.content || "";

        try {
            console.log(`OpenRouter Stream: Sending request to primary model "${primaryModel}"...`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                    "X-OpenRouter-Title": "Chatterbot AI"
                },
                body: JSON.stringify({
                    model: primaryModel,
                    messages: recentMessages,
                    max_tokens: 1500,
                    temperature: 0.7,
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errReason = data.error?.message || (typeof data.error === 'string' ? data.error : null) || `HTTP ${response.status}`;
                throw new Error(`[Status ${response.status}] ${errReason}`);
            }

            await parseStream(response, onChunk, openRouterParser, signal);
        } catch (err) {
            if (err.name === "AbortError") throw err;
            console.warn(`Primary model stream failed, attempting fallback to "${backupModel}"... Reason:`, err.message);
            
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
                        "X-OpenRouter-Title": "Chatterbot AI"
                    },
                    body: JSON.stringify({
                        model: backupModel,
                        messages: recentMessages,
                        max_tokens: 1500,
                        temperature: 0.7,
                        stream: true
                    }),
                    signal
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    const errReason = data.error?.message || (typeof data.error === 'string' ? data.error : null) || `HTTP ${response.status}`;
                    throw new Error(`[Status ${response.status}] ${errReason}`);
                }

                await parseStream(response, onChunk, openRouterParser, signal);
            } catch (fallbackErr) {
                if (fallbackErr.name === "AbortError") throw fallbackErr;
                console.warn("All OpenRouter AI streaming routes failed:", fallbackErr.message);
                
                if (process.env.GEMINI_API_KEY) {
                    console.log("Attempting direct Native Gemini API stream fallback...");
                    const nativeModelName = primaryModel.startsWith("google/") ? primaryModel.replace("google/", "") : primaryModel;
                    return await streamNativeGemini({ messages, message, systemPrompt, model: nativeModelName, onChunk, signal });
                }

                throw fallbackErr;
            }
        }
    } else if (process.env.GEMINI_API_KEY) {
        console.log("No OpenRouter API key found or requested native Gemini model stream directly...");
        return await streamNativeGemini({ messages, message, systemPrompt, model, onChunk, signal });
    } else {
        throw new Error('Either OPENROUTER_API_KEY or GEMINI_API_KEY environment variable is required');
    }
};
