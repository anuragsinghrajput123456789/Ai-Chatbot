const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);

const withTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            const timeoutError = new Error('Ollama request timed out');
            timeoutError.statusCode = 504;
            throw timeoutError;
        }

        const connectionError = new Error('Please start Ollama locally to use offline mode.');
        connectionError.statusCode = 503;
        connectionError.details = err.message;
        throw connectionError;
    } finally {
        clearTimeout(timeout);
    }
};

const parseJsonResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        const err = new Error('Ollama returned an invalid response');
        err.statusCode = 502;
        err.details = text;
        throw err;
    }
};

export const getOllamaStatus = async () => {
    const response = await withTimeout(`${OLLAMA_BASE_URL}/api/tags`, {}, 10000);
    if (!response.ok) {
        const err = new Error('Ollama is not responding correctly');
        err.statusCode = 503;
        throw err;
    }

    return { running: true };
};

export const getOllamaModels = async () => {
    const response = await withTimeout(`${OLLAMA_BASE_URL}/api/tags`, {}, 5000);
    const data = await parseJsonResponse(response);

    if (!response.ok) {
        const err = new Error(data.error || 'Failed to fetch Ollama models');
        err.statusCode = response.status;
        throw err;
    }

    return data.models || [];
};

export const generateOllamaReply = async ({ model, prompt, stream = false }) => {
    const response = await withTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream }),
    });

    const text = await response.text();
    let data = {};

    if (stream && response.ok) {
        data.response = text
            .split('\n')
            .filter(Boolean)
            .map((line) => {
                try {
                    return JSON.parse(line).response || '';
                } catch {
                    return '';
                }
            })
            .join('');
    } else if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            const err = new Error('Ollama returned an invalid response');
            err.statusCode = 502;
            err.details = text;
            throw err;
        }
    }

    if (!response.ok) {
        const err = new Error(data.error || 'Failed to generate Ollama response');
        err.statusCode = response.status === 404 ? 404 : response.status;
        if (data.error?.toLowerCase().includes('not found')) {
            err.message = `Ollama model "${model}" is not installed`;
        }
        throw err;
    }

    const reply = data.response?.trim();
    if (!reply) {
        const err = new Error('Ollama response was empty');
        err.statusCode = 502;
        throw err;
    }

    return reply;
};
