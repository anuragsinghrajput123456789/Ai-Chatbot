/**
 * Ollama Service — Direct Browser-to-Localhost Communication
 *
 * All offline AI inference runs on the user's own machine.
 * The React frontend communicates directly with the user's local
 * Ollama API at http://localhost:11434. The Express backend is
 * NEVER involved in offline inference.
 */

const OLLAMA_BASE_URL = "http://localhost:11434";

const getTimeoutSignal = (ms) => {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

/**
 * Check whether Ollama is running by requesting GET /api/tags.
 * @returns {{ running: boolean, error: string }}
 */
export async function fetchOllamaStatus() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: getTimeoutSignal(5000),
    });

    if (!res.ok) {
      return {
        running: false,
        error: "Ollama is not responding correctly.",
      };
    }

    return { running: true, error: "" };
  } catch {
    return {
      running: false,
      error: "Ollama is not running. Please install and start Ollama on your computer.",
    };
  }
}

/**
 * Fetch the list of locally installed Ollama models.
 * @returns {Array<{ name: string, size: number, ... }>}
 */
export async function fetchOllamaModels() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: getTimeoutSignal(5000),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Ollama models.");
    }

    const data = await res.json();
    return data.models || [];
  } catch (err) {
    throw new Error(err.message || "Failed to fetch Ollama models.");
  }
}

/**
 * Send a chat message directly to the user's local Ollama instance.
 *
 * Uses the /api/chat endpoint with the full conversation history
 * formatted as an array of { role, content } objects.
 *
 * @param {{ model: string, messages: Array<{ role: string, content: string }>, signal: AbortSignal }} params
 * @returns {string} The assistant's reply text.
 */
export async function sendOllamaChatMessage({ model, messages, signal }) {
  // Combine user cancellation signal with a 120-second timeout for slow local models
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 120000);

  // If the caller's signal fires, also abort our internal controller
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw signal.reason || new DOMException("The user aborted a request.", "AbortError");
    }
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      timeoutController.abort();
    }, { once: true });
  }

  let res;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: timeoutController.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      // Check if this was our timeout or the user's cancellation
      if (signal?.aborted) throw err;
      throw new Error("Ollama request timed out. The model may be loading or your prompt may be too long. Please try again.");
    }
    // Connection refused or network error
    if (err instanceof TypeError || err.message?.includes("fetch")) {
      throw new Error("Cannot connect to Ollama at localhost:11434. Please ensure Ollama is running.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = "Failed to generate response from Ollama.";

    try {
      const data = JSON.parse(text);
      if (data.error) {
        errorMsg = data.error;
        if (data.error.toLowerCase().includes("not found")) {
          errorMsg = `Model "${model}" is not installed. Run: ollama pull ${model}`;
        }
      }
    } catch {
      // Non-JSON error body — use default message
    }

    throw new Error(errorMsg);
  }

  const data = await res.json();
  const reply = data.message?.content?.trim();

  if (!reply) {
    throw new Error("Ollama returned an empty response.");
  }

  return reply;
}

/**
 * Sends a chat message directly to the local Ollama instance and streams the response chunk by chunk.
 * Supports cancellation via AbortSignal.
 *
 * @param {{ model: string, messages: Array<{ role: string, content: string }>, signal: AbortSignal, onChunk: (text: string) => void }} params
 */
export async function sendOllamaChatMessageStream({ model, messages, signal, onChunk }) {
  let res;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw err;
    }
    if (err instanceof TypeError || err.message?.includes("fetch")) {
      throw new Error("Cannot connect to Ollama at localhost:11434. Please ensure Ollama is running.");
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = "Failed to generate response from Ollama.";
    try {
      const data = JSON.parse(text);
      if (data.error) {
        errorMsg = data.error;
        if (data.error.toLowerCase().includes("not found")) {
          errorMsg = `Model "${model}" is not installed. Run: ollama pull ${model}`;
        }
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep the last partial line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            onChunk(parsed.message.content);
          }
        } catch (e) {
          console.warn("Failed to parse Ollama stream chunk:", e);
        }
      }
    }

    // Process any remaining text in buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.message?.content) {
          onChunk(parsed.message.content);
        }
      } catch {}
    }
  } finally {
    reader.releaseLock();
  }
}
