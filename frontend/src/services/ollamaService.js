import { API_URL, authHeaders, readError } from "./http";

export async function fetchOllamaStatus() {
  try {
    const res = await fetch(`${API_URL}/ollama/status`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    const data = await res.json();
    return {
      running: Boolean(data.running),
      error: data.error || "",
    };
  } catch (err) {
    // Network error or backend offline
    return {
      running: false,
      error: "Cannot reach backend server.",
    };
  }
}

export async function fetchOllamaModels() {
  try {
    const res = await fetch(`${API_URL}/ollama/models`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errMsg = await readError(res, "Failed to fetch Ollama models");
      throw new Error(errMsg);
    }

    const data = await res.json();
    return data.models || [];
  } catch (err) {
    throw new Error(err.message || "Failed to fetch Ollama models");
  }
}
