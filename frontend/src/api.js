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

export async function sendMessageToBackend(message, systemPrompt, mode, modelName, chatId, signal) {
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
    signal,
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

export async function searchConversations(query, page = 1, limit = 5, startDate = null, endDate = null, workspaceId = null) {
  const token = getToken();
  if (!token) return { results: [], pagination: { total: 0, page: 1, limit, pages: 0 } };
  
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString()
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (workspaceId) params.append("workspaceId", workspaceId);

  const res = await apiCall(`${API_URL}/chat/search?${params.toString()}`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Search failed"));
  return res.json();
}

export async function fetchWorkspaces() {
  const res = await apiCall(`${API_URL}/workspaces`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to fetch workspaces"));
  return res.json();
}

export async function createWorkspace(data) {
  const res = await apiCall(`${API_URL}/workspaces`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to create workspace"));
  return res.json();
}

export async function deleteWorkspace(workspaceId) {
  const res = await apiCall(`${API_URL}/workspaces/${workspaceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to delete workspace"));
  return res.json();
}

export async function moveChatToWorkspace(chatId, workspaceId) {
  const res = await apiCall(`${API_URL}/chat/${chatId}/workspace`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ workspaceId }),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to move chat"));
  return res.json();
}

export async function duplicateChat(chatId) {
  const res = await apiCall(`${API_URL}/chat/${chatId}/duplicate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to duplicate chat"));
  return res.json();
}

export async function toggleFavoriteChat(chatId) {
  const res = await apiCall(`${API_URL}/chat/${chatId}/favorite`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to toggle favorite"));
  return res.json();
}

export async function toggleArchiveChat(chatId) {
  const res = await apiCall(`${API_URL}/chat/${chatId}/archive`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to toggle archive"));
  return res.json();
}

export async function uploadDocument(file, chatId) {
  const formData = new FormData();
  formData.append("file", file);
  if (chatId) {
    formData.append("chatId", chatId);
  }

  const res = await apiCall(`${API_URL}/documents/upload`, {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to upload document"));
  return res.json();
}

export async function fetchChatDocuments(chatId) {
  const cId = chatId || "null";
  const res = await apiCall(`${API_URL}/documents/chat/${cId}`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to fetch documents"));
  return res.json();
}

export async function deleteDocument(docId) {
  const res = await apiCall(`${API_URL}/documents/${docId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to delete document"));
  return res.json();
}

export async function reindexDocument(docId) {
  const res = await apiCall(`${API_URL}/documents/reindex/${docId}`, {
    method: "POST",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to reindex document"));
  return res.json();
}

export async function retrieveOfflineCitations(chatId, query) {
  const cId = chatId || "null";
  const res = await apiCall(`${API_URL}/documents/chat/${cId}/retrieve?query=${encodeURIComponent(query)}`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to retrieve citations"));
  return res.json();
}

export async function exportUserChats() {
  const res = await apiCall(`${API_URL}/chat/export`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to export chats"));
  return res.json();
}

export async function importUserChats(chats) {
  const res = await apiCall(`${API_URL}/chat/import`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ chats })
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to import chats"));
  return res.json();
}

export async function fetchAllDocuments() {
  const res = await apiCall(`${API_URL}/documents`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to fetch all documents"));
  return res.json();
}
