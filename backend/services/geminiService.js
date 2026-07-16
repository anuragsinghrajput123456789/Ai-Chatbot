const callNativeGemini = async ({ messages, message, systemPrompt }) => {
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

    try {
        const model = "gemini-2.5-flash";
        console.log(`Native Gemini: Sending request to model "${model}"...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (err) {
        console.warn("Native gemini-2.5-flash failed, attempting fallback to gemini-1.5-flash...", err.message);
        
        try {
            const model = "gemini-1.5-flash";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15000)
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

export const generateGeminiReply = async ({ messages, message, systemPrompt }) => {
    let reply = "";

    // If OpenRouter API key is configured, try OpenRouter first
    if (process.env.OPENROUTER_API_KEY) {
        const recentMessages = messages.slice(-12).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        if (systemPrompt?.trim()) {
            recentMessages.unshift({ role: 'system', content: systemPrompt.trim() });
        }

        recentMessages.push({ role: 'user', content: message });

        const primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash";
        const backupModel = "google/gemini-flash-1.5";

        try {
            console.log(`OpenRouter: Sending request to primary model "${primaryModel}"...`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: primaryModel,
                    messages: recentMessages,
                    max_tokens: 1500,
                    temperature: 0.7
                }),
                signal: AbortSignal.timeout(15000)
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
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: backupModel,
                        messages: recentMessages,
                        max_tokens: 1500,
                        temperature: 0.7
                    }),
                    signal: AbortSignal.timeout(15000)
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
                        return await callNativeGemini({ messages, message, systemPrompt });
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
        console.log("No OpenRouter API key found, using native Google Gemini API directly...");
        return await callNativeGemini({ messages, message, systemPrompt });
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

