import { API_URL, authHeaders, getToken, readError, fetchWithTimeout } from "./services/http";

export { API_URL, getToken };

// Utility wrapper to catch network/CORS errors and convert to friendly errors
async function apiCall(url, options = {}) {
  try {
    const res = await fetchWithTimeout(url, options);
    return res;
  } catch (err) {
    // If it's already a timeout error or a structured error, propagate it
    if (err.message.includes("timed out") || err.message.includes("Ollama")) {
      throw err;
    }
    // TypeError usually means network down or CORS blockage
    if (err instanceof TypeError) {
      throw new Error("Unable to connect to the server. Please check your network or server status.");
    }
    throw err;
  }
}

export async function loginUser(email, password) {
  const res = await apiCall(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res, "Login failed"));
  return res.json();
}

export async function registerUser(username, email, password) {
  const res = await apiCall(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error(await readError(res, "Registration failed"));
  return res.json();
}

export async function updateUserAvatar(avatar) {
  const res = await apiCall(`${API_URL}/auth/profile/avatar`, {
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
  try {
    const res = await apiCall(`${API_URL}/chat`, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchChatSession(chatId) {
  const token = getToken();
  if (!token || !chatId) return [];
  try {
    const res = await apiCall(`${API_URL}/chat/${chatId}`, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function deleteChatHistory() {
  const res = await apiCall(`${API_URL}/chat`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to delete chat"));
  return res.json();
}

export async function deleteChatSession(chatId) {
  const res = await apiCall(`${API_URL}/chat/${chatId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to delete chat session"));
  return res.json();
}

export async function renameChatSession(chatId, title) {
  const res = await apiCall(`${API_URL}/chat/${chatId}/title`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to rename chat session"));
  return res.json();
}

export async function sendMessageToBackend(message, systemPrompt, mode, modelName, chatId) {
  const body = { message, systemPrompt, mode };
  if (modelName) body.modelName = modelName;
  if (chatId) body.chatId = chatId;

  const res = await apiCall(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    timeout: 30000, // 30 seconds for AI answers
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to send message"));
  }

  return res.json();
}

export async function updateSavedChatMessage(messageId, text) {
  const res = await apiCall(`${API_URL}/chat/messages/${messageId}`, {
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
  const res = await apiCall(`${API_URL}/chat/messages/${messageId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to delete message"));
  return res.json();
}
