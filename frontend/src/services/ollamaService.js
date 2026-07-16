/**
 * Ollama Service — Direct Browser-to-Localhost Communication
 *
 * All offline AI inference runs on the user's own machine.
 * The React frontend communicates directly with the user's local
 * Ollama API at http://localhost:11434. The Express backend is
 * NEVER involved in offline inference.
 */

const OLLAMA_BASE_URL = "http://localhost:11434";

/**
 * Check whether Ollama is running by requesting GET /api/tags.
 * @returns {{ running: boolean, error: string }}
 */
export async function fetchOllamaStatus() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
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
      signal: AbortSignal.timeout(5000),
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
 * @param {{ model: string, messages: Array<{ role: string, content: string }> }} params
 * @returns {string} The assistant's reply text.
 */
export async function sendOllamaChatMessage({ model, messages }) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

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
