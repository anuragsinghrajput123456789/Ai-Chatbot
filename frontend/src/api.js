import { API_URL, authHeaders, getToken, readError } from "./services/http";

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

export async function updateUserAvatar(avatar) {
  const res = await fetch(`${API_URL}/auth/profile/avatar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ avatar }),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to update avatar"));
  return res.json();
}

export async function fetchChatList() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_URL}/chat`, {
    headers: authHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchChatSession(chatId) {
  const token = getToken();
  if (!token || !chatId) return [];
  const res = await fetch(`${API_URL}/chat/${chatId}`, {
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

export async function deleteChatSession(chatId) {
  const res = await fetch(`${API_URL}/chat/${chatId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Failed to delete chat session");
  return res.json();
}

export async function renameChatSession(chatId, title) {
  const res = await fetch(`${API_URL}/chat/${chatId}/title`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename chat session");
  return res.json();
}

export async function sendMessageToBackend(message, systemPrompt, mode, modelName, chatId) {
  const body = { message, systemPrompt, mode };
  if (modelName) body.modelName = modelName;
  if (chatId) body.chatId = chatId;

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to send message"));
  }

  return res.json();
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
