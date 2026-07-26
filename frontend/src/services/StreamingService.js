import { API_URL } from "./http";

const OLLAMA_BASE_URL = "http://localhost:11434";

/**
 * Unified Streaming Service (Frontend)
 * 
 * Exposes a single interface for consuming streams from either
 * local Ollama instances (direct browser-to-localhost fetch) or
 * cloud Gemini/OpenRouter (fetch to backend SSE streaming endpoint).
 * 
 * Supports AbortController cancellation natively.
 */
export async function streamChatCompletion({
  provider,
  model,
  messages,
  systemPrompt,
  chatId,
  workspaceId,
  signal,
  onChunk,
  onMetadata,
  token
}) {
  let res;

  if (provider === "offline") {
    // -----------------------------------------------------
    // Offline Mode: Direct Client-to-Localhost (Ollama)
    // -----------------------------------------------------
    const formattedMessages = [];
    if (systemPrompt?.trim()) {
      formattedMessages.push({ role: "system", content: systemPrompt.trim() });
    }
    for (const msg of messages) {
      formattedMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text
      });
    }

    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true
      }),
      signal
    });
  } else {
    // -----------------------------------------------------
    // Online Mode: Client-to-Backend SSE (Gemini/OpenRouter)
    // -----------------------------------------------------
    // The current active prompt is the text of the last user message
    const lastUserMessage = messages[messages.length - 1];
    const messageText = lastUserMessage?.text || lastUserMessage?.content || "";

    const historyMessages = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      text: msg.text || msg.content || ""
    }));

    const body = {
      message: messageText,
      messages: historyMessages,
      systemPrompt,
      mode: "online",
      modelName: model,
      stream: true
    };
    if (chatId) body.chatId = chatId;
    if (workspaceId) body.workspaceId = workspaceId;

    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
      signal
    });
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = JSON.parse(text);
      errorMsg = data.error || errorMsg;
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
      buffer = lines.pop(); // Hold onto any trailing partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (provider === "offline") {
          // Ollama JSON parsing
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.message?.content) {
              onChunk(parsed.message.content);
            }
          } catch (e) {
            console.warn("Failed to parse Ollama chunk:", e);
          }
        } else {
          // Backend SSE parsing (data: {...})
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                onChunk(parsed.text);
              }
              if (parsed.metadata) {
                onMetadata(parsed.metadata);
              }
              if (parsed.citations) {
                onMetadata({ citations: parsed.citations });
              }
            } catch (e) {
              if (e.message?.includes("SyntaxError")) {
                console.warn("Failed to parse SSE data chunk:", e);
              } else {
                throw e; // Bubble up execution errors
              }
            }
          }
        }
      }
    }

    // Process remaining buffer data if it exists
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (provider === "offline") {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.message?.content) {
            onChunk(parsed.message.content);
          }
        } catch {}
      } else {
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr !== "[DONE]") {
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) onChunk(parsed.text);
              if (parsed.metadata) onMetadata(parsed.metadata);
              if (parsed.citations) onMetadata({ citations: parsed.citations });
            } catch (e) {
              if (!e.message?.includes("SyntaxError")) throw e;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
