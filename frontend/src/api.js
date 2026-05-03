import { API_URL, authHeaders, getToken, readError } from "./services/http";
import { sendGeminiMessage } from "./services/geminiService";

export { API_URL, getToken };

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res, "Login failed"));
  return res.json();
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error(await readError(res, "Registration failed"));
  return res.json();
}

export async function fetchChatHistory() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_URL}/chat`, {
    headers: authHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}

export async function deleteChatHistory() {
  const res = await fetch(`${API_URL}/chat`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Failed to delete chat");
  return res.json();
}

export async function sendMessageToBackend(message, systemPrompt) {
  return sendGeminiMessage(message, systemPrompt);
}

export async function updateSavedChatMessage(messageId, text) {
  const res = await fetch(`${API_URL}/chat/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to update message"));
  return res.json();
}

export async function deleteSavedChatMessage(messageId) {
  const res = await fetch(`${API_URL}/chat/messages/${messageId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to delete message"));
  return res.json();
}
