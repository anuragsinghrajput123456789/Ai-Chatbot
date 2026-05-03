import { API_URL, authHeaders, readError } from "./http";

export async function sendGeminiMessage(message, systemPrompt) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ message, systemPrompt }),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to send message"));
  }

  return res.json();
}
