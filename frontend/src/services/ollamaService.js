import { API_URL, authHeaders, readError } from "./http";

export async function fetchOllamaStatus() {
  const res = await fetch(`${API_URL}/ollama/status`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  return {
    running: Boolean(data.running),
    error: data.error || "",
  };
}

export async function fetchOllamaModels() {
  const res = await fetch(`${API_URL}/ollama/models`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to fetch Ollama models"));
  }

  const data = await res.json();
  return data.models || [];
}

