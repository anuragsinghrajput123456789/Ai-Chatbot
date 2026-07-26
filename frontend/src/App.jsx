import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatInterface from "./components/ChatInterface";
import Layout from "./components/Layout";
import { ChatSettingsProvider, useChatSettings } from "./context/ChatSettingsContext";
import { MODES } from "./constants";
import LandingPage from "./components/LandingPage";
import AuthPage from "./pages/AuthPage";
import OfflineSetup from "./pages/OfflineSetup";
import ErrorBoundary from "./components/ErrorBoundary";
import SmoothScroll from "./components/SmoothScroll";
import { 
  deleteSavedChatMessage, fetchChatList, fetchChatSession, deleteChatHistory, 
  sendMessageToBackend, updateSavedChatMessage, deleteChatSession, renameChatSession, 
  updateUserAvatar, retrieveOfflineCitations 
} from "./api";
import { sendOllamaChatMessage, sendOllamaChatMessageStream } from "./services/ollamaService";
import { streamChatCompletion } from "./services/StreamingService";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  return (
    <ErrorBoundary>
      <ChatSettingsProvider>
        <AppRoutes />
      </ChatSettingsProvider>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const GUEST_CHAT_KEY = "guestChatMessages";
  const [activeMode, setActiveMode] = useState("chat");
  const isDarkMode = true;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { provider, selectedOllamaModel, ollamaStatus } = useChatSettings();

  // Auth State
  const [user, setUser] = useState(null);
  const [activeAbortController, setActiveAbortController] = useState(null);

  const handleCancelRequest = () => {
    if (activeAbortController) {
      activeAbortController.abort();
      setActiveAbortController(null);
    }
  };

  const readGuestMessages = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_CHAT_KEY) || "[]").map((msg) => ({
        ...msg,
        _id: msg._id || `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
    } catch {
      return [];
    }
  };

  const createLocalMessage = (role, text) => ({
    _id: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
  });

  const sanitizeErrorMessage = (msg) => {
    if (!msg) return "Something went wrong. Please try again.";
    const lower = msg.toLowerCase();
    
    if (provider === "offline") {
      if (lower.includes("econnrefused") || lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("cannot connect")) {
        return "Cannot connect to the local Ollama server at http://localhost:11434. Please ensure Ollama is installed and running.";
      }
      if (lower.includes("not found") || lower.includes("pull")) {
        return `The selected model "${selectedOllamaModel || "model_name"}" is not installed locally. Please open your terminal and run: ollama pull ${selectedOllamaModel || "llama3"}`;
      }
      if (lower.includes("timed out") || lower.includes("timeout")) {
        return "Local inference timed out. Your model might still be loading, or your prompt is too large.";
      }
      return msg;
    }

    if (lower.includes("econnrefused") || lower.includes("failed to fetch") || lower.includes("networkerror"))
      return "Unable to connect to the server. Please check your network or server status.";
    if (lower.includes("timed out") || lower.includes("timeout"))
      return "The request took too long. Please try again.";
    if (lower.includes("429") || lower.includes("too many requests"))
      return "Too many requests. Please wait a moment and try again.";
    if (lower.includes("503") || lower.includes("unavailable"))
      return "The AI service is temporarily unavailable. Please try again shortly.";
    if (lower.includes("401") || lower.includes("unauthorized") || lower.includes("expired"))
      return "Your session has expired. Please log in again.";
    return msg;
  };

  const loadChatList = useCallback(async () => {
    try {
      const history = await fetchChatList();
      setChatList(history);
    } catch (err) {
      console.error("Failed to load chat list", err);
    }
  }, []);

  const handleSelectChat = useCallback(async (chatId) => {
    setCurrentChatId(chatId);
    try {
      const sessionMessages = await fetchChatSession(chatId);
      setMessages(sessionMessages);
    } catch (err) {
      console.error("Failed to load chat session", err);
    }
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("username");
    const savedAvatar = localStorage.getItem("avatar");
    const savedEmail = localStorage.getItem("email");
    const savedOnlineUseCount = parseInt(localStorage.getItem("onlineUseCount") || "0", 10);
    
    if (savedToken && savedName) {
      setUser({ 
        token: savedToken, 
        username: savedName, 
        avatar: savedAvatar || 'Bot',
        email: savedEmail || "",
        onlineUseCount: savedOnlineUseCount || 0
      });
      
      const initChats = async () => {
        try {
          const history = await fetchChatList();
          setChatList(history);
          if (history.length > 0) {
            handleSelectChat(history[0]._id);
          }
        } catch (err) {
          console.error("Failed to initialize chat list", err);
        }
      };
      initChats();
    } else {
      setMessages(readGuestMessages());
    }
    document.documentElement.classList.add('dark');
    setIsAuthReady(true);
  }, []);

  // C3 fix: Debounced localStorage write for guest messages
  const guestSaveTimerRef = useRef(null);
  useEffect(() => {
    if (isAuthReady && !user && !currentChatId) {
      if (guestSaveTimerRef.current) clearTimeout(guestSaveTimerRef.current);
      guestSaveTimerRef.current = setTimeout(() => {
        localStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(messages));
      }, 500);
    }
    return () => {
      if (guestSaveTimerRef.current) clearTimeout(guestSaveTimerRef.current);
    };
  }, [messages, user, isAuthReady, currentChatId]);

  const toggleDarkMode = () => {
    // Force permanent dark mode - no-op
  };

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("avatar", userData.avatar || 'Bot');
    localStorage.setItem("email", userData.email || "");
    localStorage.setItem("onlineUseCount", (userData.onlineUseCount || 0).toString());
    setUser(userData);
    loadChatList();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("email");
    localStorage.removeItem("onlineUseCount");
    setUser(null);
    setChatList([]);
    setCurrentChatId(null);
    setMessages(readGuestMessages());
  };

  const handleChangeAvatar = async (newAvatar) => {
    try {
      const data = await updateUserAvatar(newAvatar);
      const updatedUser = { ...user, avatar: data.avatar };
      setUser(updatedUser);
      localStorage.setItem("avatar", data.avatar);
    } catch {
      alert("Failed to update avatar");
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to delete your entire chat history?")) return;
    try {
      if (user) {
        await deleteChatHistory();
        setChatList([]);
        setCurrentChatId(null);
      }
      setMessages([]);
      if (!user) {
        localStorage.removeItem(GUEST_CHAT_KEY);
      }
    } catch (err) {
      console.error(err);
      alert("Could not delete chat history");
    }
  };

  const handleDeleteChatSession = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await deleteChatSession(chatId);
      setChatList(prev => prev.filter(c => c._id !== chatId));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      console.error(err);
      alert("Could not delete chat session");
    }
  };

  const handleRenameChatSession = async (chatId, newTitle) => {
    try {
      const data = await renameChatSession(chatId, newTitle);
      setChatList(prev => prev.map(c => c._id === chatId ? { ...c, title: data.chat.title } : c));
    } catch (err) {
      console.error(err);
      alert("Could not rename chat session");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput("");
    setIsTyping(true);

    const newUserMsg = createLocalMessage("user", userMsg);
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    setActiveAbortController(controller);

    const modelMsgId = `stream-${Date.now()}`;
    let accumulatedReply = "";

    try {
      let finalSystemPrompt = MODES[activeMode].systemPrompt;
      let offlineCitations = [];

      if (provider === "offline") {
        if (!ollamaStatus.running) throw new Error("Please start Ollama on your computer to use offline mode.");
        if (!selectedOllamaModel) throw new Error("Choose or enter an Ollama model before sending.");

        try {
          const retData = await retrieveOfflineCitations(currentChatId, userMsg);
          offlineCitations = retData.citations || [];
          if (offlineCitations.length > 0) {
            const contextText = offlineCitations.map((c, i) => `[Source ${i+1}: ${c.docName} (Confidence: ${(c.score * 100).toFixed(0)}%)]\n${c.text}`).join('\n\n');
            finalSystemPrompt = `${finalSystemPrompt}\n\n[Grounded Document Context]\nYou have access to the following documents for answering the user's question. Ground your answer strictly in this context. Use inline citations like [Source 1], [Source 2], etc. where applicable. If the context does not contain the answer, rely on your general knowledge but explicitly state that the documents were insufficient.\n\n${contextText}`.trim();
          }
        } catch (err) {
          console.warn("Local RAG context fetch skipped/failed", err);
        }
      }

      // Add empty response block to be filled during stream
      setMessages(prev => [...prev, {
        _id: modelMsgId,
        role: "model",
        text: "",
        citations: offlineCitations.length > 0 ? offlineCitations : undefined,
        timestamp: new Date().toISOString()
      }]);

      await streamChatCompletion({
        provider,
        model: provider === "offline" ? selectedOllamaModel : onlineModel,
        messages: [...messages, newUserMsg],
        systemPrompt: finalSystemPrompt,
        chatId: currentChatId,
        workspaceId: activeWorkspaceId !== "all" && activeWorkspaceId !== "unassigned" ? activeWorkspaceId : null,
        signal: controller.signal,
        token: user?.token,
        onChunk: (chunk) => {
          accumulatedReply += chunk;
          setIsTyping(false);
          setMessages(prev => prev.map(msg => 
            msg._id === modelMsgId ? { ...msg, text: accumulatedReply } : msg
          ));
        },
        onMetadata: (metadata) => {
          if (metadata.chatId) {
            setCurrentChatId(metadata.chatId);
            loadChatList(); // Refresh list to get new title
          }
          if (metadata.onlineUseCount !== undefined) {
            setUser(prev => {
              if (!prev) return prev;
              const nextUser = { ...prev, onlineUseCount: metadata.onlineUseCount };
              localStorage.setItem("onlineUseCount", metadata.onlineUseCount.toString());
              return nextUser;
            });
          }
          if (metadata.messages) {
            setMessages(metadata.messages);
          }
          if (metadata.citations) {
            setMessages(prev => prev.map(msg => 
              msg._id === modelMsgId ? { ...msg, citations: metadata.citations } : msg
            ));
          }
        }
      });

      setIsTyping(false);
    } catch (err) {
      setIsTyping(false);
      const friendlyMsg = err.name === "AbortError" 
        ? "Generation stopped."
        : sanitizeErrorMessage(err.message);
      
      setMessages(prev => prev.map(msg => 
        msg._id === modelMsgId 
          ? { 
              ...msg, 
              text: accumulatedReply 
                ? (err.name === "AbortError" ? accumulatedReply : `${accumulatedReply}\n\n⚠️ ${friendlyMsg}`) 
                : `⚠️ ${friendlyMsg}` 
            } 
          : msg
      ));
    } finally {
      setIsLoading(false);
      setActiveAbortController(null);
    }
  };

  const handleUpdateMessage = async (messageId, text) => {
    if (!text.trim()) return;

    try {
      if (user && !messageId.startsWith("guest-")) {
        const data = await updateSavedChatMessage(messageId, text);
        setMessages(data.messages || messages);
        return;
      }

      setMessages(prev => prev.map(msg => (
        msg._id === messageId ? { ...msg, text: text.trim() } : msg
      )));
    } catch (err) {
      alert(err.message || "Could not update message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      if (user && !messageId.startsWith("guest-")) {
        const data = await deleteSavedChatMessage(messageId);
        setMessages(data.messages || []);
        return;
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      alert(err.message || "Could not delete message");
    }
  };

  return (
    <BrowserRouter>
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <AuthPage mode="login" onLogin={handleLogin} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/signup" element={user ? <Navigate to="/chat" replace /> : <AuthPage mode="signup" onLogin={handleLogin} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />

        <Route
          path="/chat"
          element={
            <Layout
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              activeMode={activeMode}
              user={user}
              onLogout={handleLogout}
              onClearChat={handleClearChat}
              onChangeAvatar={handleChangeAvatar}
              chatList={chatList}
              currentChatId={currentChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChatSession={handleDeleteChatSession}
              onRenameChatSession={handleRenameChatSession}
              activeWorkspaceId={activeWorkspaceId}
              setActiveWorkspaceId={setActiveWorkspaceId}
              onRefreshChatList={loadChatList}
            >
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                isTyping={isTyping}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                onCancel={handleCancelRequest}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                isDarkMode={isDarkMode}
                user={user}
                onUpdateMessage={handleUpdateMessage}
                onDeleteMessage={handleDeleteMessage}
                currentChatId={currentChatId}
              />
            </Layout>
          }
        />

        <Route
          path="/offline"
          element={
            <Layout
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              activeMode={activeMode}
              user={user}
              onLogout={handleLogout}
              onClearChat={handleClearChat}
              onChangeAvatar={handleChangeAvatar}
              chatList={chatList}
              currentChatId={currentChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChatSession={handleDeleteChatSession}
              onRenameChatSession={handleRenameChatSession}
              activeWorkspaceId={activeWorkspaceId}
              setActiveWorkspaceId={setActiveWorkspaceId}
              onRefreshChatList={loadChatList}
            >
              <OfflineSetup
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                user={user}
                onLogout={handleLogout}
                chatList={chatList}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChatSession={handleDeleteChatSession}
                onRenameChatSession={handleRenameChatSession}
                onChangeAvatar={handleChangeAvatar}
                handleClearChat={handleClearChat}
              />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
