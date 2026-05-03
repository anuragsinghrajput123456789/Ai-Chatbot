import React, { useState, useEffect } from "react";
import ChatInterface from "./components/ChatInterface";
import Layout from "./components/Layout";
import { ChatSettingsProvider, useChatSettings } from "./context/ChatSettingsContext";
import { MODES } from "./constants";
import LandingPage from "./components/LandingPage";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import Contact from "./pages/Contact";
import { deleteSavedChatMessage, fetchChatHistory, deleteChatHistory, sendMessageToBackend, updateSavedChatMessage } from "./api";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  return (
    <ChatSettingsProvider>
      <AppRoutes />
    </ChatSettingsProvider>
  );
}

function AppRoutes() {
  const GUEST_CHAT_KEY = "guestChatMessages";
  const [activeMode, setActiveMode] = useState("chat");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { provider, selectedOllamaModel, ollamaStatus } = useChatSettings();

  // Auth State
  const [user, setUser] = useState(null);

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

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory();
      setMessages(history);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("username");
    if (savedToken && savedName) {
      setUser({ token: savedToken, username: savedName });
      loadHistory();
    } else {
      setMessages(readGuestMessages());
    }
    document.documentElement.classList.add('dark');
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (isAuthReady && !user) {
      localStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(messages));
    }
  }, [messages, user, isAuthReady]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username);
    setUser(userData);
    loadHistory();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setMessages(readGuestMessages());
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to delete your entire chat history?")) return;
    try {
      if (user) {
        await deleteChatHistory();
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput("");
    setIsTyping(true);

    setMessages(prev => [...prev, createLocalMessage("user", userMsg)]);
    setIsLoading(true);

    try {
      let reply;

      if (provider === "offline") {
        if (!ollamaStatus.running) {
          throw new Error("Please start Ollama locally to use offline mode.");
        }

        if (!selectedOllamaModel) {
          throw new Error("Choose or enter an Ollama model before sending.");
        }

        const data = await sendMessageToBackend(userMsg, MODES[activeMode].systemPrompt, 'offline', selectedOllamaModel);
        reply = data.reply;

        if (user && data.messages) {
          setIsTyping(false);
          setMessages(data.messages);
          return;
        }
      } else {
        const data = await sendMessageToBackend(userMsg, MODES[activeMode].systemPrompt);
        reply = data.reply;

        if (user && data.messages) {
          setIsTyping(false);
          setMessages(data.messages);
          return;
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, createLocalMessage("model", reply)]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "model", text: err.message || "Error: Could not connect to server." }]);
    } finally {
      setIsLoading(false);
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
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <LandingPage
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/chat" replace />
            ) : (
              <AuthPage
                mode="login"
                onLogin={handleLogin}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/chat" replace />
            ) : (
              <AuthPage
                mode="signup"
                onLogin={handleLogin}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
            )
          }
        />
        <Route path="/about" element={<About isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} onLogout={handleLogout} />} />
        <Route path="/contact" element={<Contact isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} onLogout={handleLogout} />} />

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
            >
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                isTyping={isTyping}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                isDarkMode={isDarkMode}
                user={user}
                onUpdateMessage={handleUpdateMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
