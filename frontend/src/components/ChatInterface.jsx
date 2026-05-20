import React, { useRef, useEffect, useState } from "react";
import { 
    User, Bot, Mic, Sparkle, Send, Cloud, HardDrive, RefreshCw, Copy, Wifi, WifiOff, Pencil, 
    Trash2, Check, X, Paperclip, ChevronDown, CheckCheck, HelpCircle, Upload, Share2, 
    MoreHorizontal, ThumbsUp, ThumbsDown, RotateCcw, Menu, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import KittyBot from "./KittyBot";
import Footer from "./Footer";
import { MODES } from "../constants";
import { useChatSettings } from "../context/ChatSettingsContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLocation } from "react-router-dom";

const ChatInterface = ({
    messages,
    isLoading,
    isTyping,
    input,
    setInput,
    onSend,
    activeMode,
    setActiveMode,
    isDarkMode,
    user,
    onUpdateMessage,
    onDeleteMessage,
    isHistoryDrawerOpen,
    onToggleHistoryDrawer
}) => {
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [copiedId, setCopiedId] = useState(null);
    const [showOfflineGuide, setShowOfflineGuide] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);
    
    // Feedback rating status mockup
    const [ratings, setRatings] = useState({});

    const chatSettings = useChatSettings();
    const location = useLocation();

    // Close dropdown on outside click
    const dropdownRef = useRef(null);
    const actionsRef = useRef(null);
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowModeDropdown(false);
            }
            if (actionsRef.current && !actionsRef.current.contains(e.target)) {
                setShowMoreActions(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Automatically transition to offline/local Llama node and expand the guide if user clicked Ollama metric on Home Page
    useEffect(() => {
        if (location.state?.selectOffline) {
            chatSettings.setProvider("offline");
            setShowOfflineGuide(true);
        }
    }, [location.state, chatSettings]);

    // Auto grow textarea whenever input content changes (for paragraphs & paste support)
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [input]);

    // Automatically open offline setup guide when selecting offline provider
    useEffect(() => {
        if (chatSettings.provider === "offline") {
            setShowOfflineGuide(true);
        }
    }, [chatSettings.provider]);

    const starterPrompts = [
        "Help me write an elegant React utility function",
        "Explain quantum computing using a simple analogy",
        "Suggest 5 unique startup ideas matching high-tech trends",
    ];

    const expertPrompts = [
        { label: "Engineering Lead", text: "Act as a senior software engineering lead. Provide production-level solutions. Explain logic briefly, then provide clean, optimized code. Highlight edge cases and architectural best practices.\n\n" },
        { label: "Design Architect", text: "Act as a premium UI/UX design director. Focus on aesthetic excellence, color harmonizations, micro-interactions, layout systems, and modern front-end styling. Keep feedback actionable.\n\n" },
        { label: "Product Innovator", text: "Act as an experienced startup Product Manager. Focus on product market fit, scalability, and UX details. Detail strategies in practical, structural steps.\n\n" },
        { label: "Quantum Educator", text: "Act as a high-end technical teacher who breaks down complex advanced systems into extremely simple, memorable analogies. Use step-by-step guidance.\n\n" },
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, user]);

    const handleCopyText = async (text, id) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const el = document.createElement("textarea");
                el.value = text;
                el.style.position = "fixed";
                el.style.opacity = "0";
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            }
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // Clipboard failure fallback
        }
    };

    const handleRateMessage = (id, type) => {
        setRatings(prev => ({
            ...prev,
            [id]: prev[id] === type ? null : type
        }));
    };

    // Mode-specific variables
    const modeConfigs = {
        chat: "theme-chat",
        code: "theme-code",
        study: "theme-study",
        creative: "theme-creative"
    };
    const activeTheme = modeConfigs[activeMode] || "theme-chat";

    return (
        <div className={`flex min-h-0 h-full w-full flex-1 flex-col overflow-hidden bg-transparent ${activeTheme}`}>
            {/* Unified top header with embedded Cognitive Engine controls */}
            <div className={`shrink-0 border-b px-4 py-3 relative z-30 overflow-visible ${
                isDarkMode ? "glass-navbar-dark border-slate-900 bg-slate-950/60" : "glass-navbar border-slate-200/80 bg-white/70"
            }`}>
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
                        {(!isHistoryDrawerOpen || window.innerWidth < 640) && user && (
                            <button
                                onClick={onToggleHistoryDrawer}
                                className={`shrink-0 rounded-lg border p-2 transition-all ${
                                    isDarkMode ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                                }`}
                                title="Expand History Log"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                        )}

                        <div className="relative shrink-0" ref={dropdownRef}>
                            <button
                                onClick={() => setShowModeDropdown(!showModeDropdown)}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${
                                    isDarkMode
                                        ? "border-slate-800/80 bg-slate-900/50 text-slate-200 hover:bg-slate-800"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
                                }`}
                            >
                                <span>{MODES[activeMode]?.label || "Select Mode"}</span>
                                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showModeDropdown ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {showModeDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className={`absolute top-full left-0 mt-1.5 z-50 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${
                                            isDarkMode
                                                ? "border-slate-800/90 bg-slate-950/95 text-slate-200 shadow-black/85"
                                                : "border-slate-200/80 bg-white/95 text-slate-800"
                                        }`}
                                    >
                                        {Object.values(MODES).map((mode) => {
                                            const isCurrent = activeMode === mode.id;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => {
                                                        setActiveMode(mode.id);
                                                        setShowModeDropdown(false);
                                                    }}
                                                    className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs font-bold transition-colors ${
                                                        isCurrent
                                                            ? isDarkMode ? "bg-slate-900 text-purple-400" : "bg-slate-100 text-purple-600"
                                                            : isDarkMode ? "text-slate-400 hover:bg-slate-900/60 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                                >
                                                    <mode.icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-purple-400" : "text-slate-500"}`} />
                                                    <span className="truncate">{mode.label}</span>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex min-w-0 items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                isDarkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50 shadow-sm"
                            }`}>
                                <Sparkle className={`h-4 w-4 animate-pulse ${isDarkMode ? "text-purple-400" : "text-purple-650"}`} />
                            </div>
                            <div className="min-w-0">
                                <span className={`block truncate text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-650"}`}>
                                    Cognitive Engine
                                </span>
                                <span className={`block truncate text-[9px] font-bold ${
                                    chatSettings.provider === "online"
                                        ? isDarkMode ? "text-slate-500" : "text-slate-500"
                                        : chatSettings.ollamaStatus.running
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                }`}>
                                    {chatSettings.provider === "online"
                                        ? "Running Gemini Cloud Intelligence"
                                        : chatSettings.ollamaStatus.running
                                            ? `Local Node Active: ${chatSettings.ollamaModel || chatSettings.customOllamaModel || "Ollama Node"}`
                                            : "Local Node Offline"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:gap-3">
                        <div className={`flex max-w-full items-center gap-1 rounded-full border p-1 transition-all ${
                            isDarkMode
                                ? "border-slate-850 bg-slate-950/80"
                                : "border-slate-250 bg-slate-50/95"
                        }`}>
                            <button
                                type="button"
                                onClick={() => chatSettings.setProvider("online")}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                                    chatSettings.provider === "online"
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)] scale-[1.02]"
                                        : isDarkMode
                                            ? "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
                                            : "border-transparent text-slate-600 hover:text-slate-950 hover:bg-white shadow-sm"
                                }`}
                            >
                                <Cloud className="h-3 w-3" />
                                <span>Gemini Cloud</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => chatSettings.setProvider("offline")}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                                    chatSettings.provider === "offline"
                                        ? chatSettings.ollamaStatus.running
                                            ? "bg-emerald-600 border-emerald-500/50 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-[1.02]"
                                            : "bg-red-600 border-red-500/50 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)] scale-[1.02]"
                                        : isDarkMode
                                            ? "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
                                            : "border-transparent text-slate-600 hover:text-slate-950 hover:bg-white shadow-sm"
                                }`}
                            >
                                <HardDrive className="h-3 w-3" />
                                <span>Local Ollama</span>
                            </button>
                        </div>


                        <button
                            onClick={() => handleCopyText(window.location.href, "share-link")}
                            className={`shrink-0 rounded-lg border p-2 transition-all ${
                                isDarkMode ? "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                            }`}
                            title="Share Chat"
                        >
                            {copiedId === "share-link" ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                        </button>

                        <div className="relative shrink-0" ref={actionsRef}>
                            <button
                                onClick={() => setShowMoreActions(!showMoreActions)}
                                className={`rounded-lg border p-2 transition-all ${
                                    isDarkMode ? "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                                }`}
                                title="More Settings"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            <AnimatePresence>
                                {showMoreActions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className={`absolute top-full right-0 mt-1.5 z-50 w-48 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${
                                            isDarkMode
                                                ? "border-slate-800/90 bg-slate-950/95 text-slate-200 shadow-black/85"
                                                : "border-slate-200/80 bg-white/95 text-slate-800"
                                        }`}
                                    >
                                        <div className="px-2.5 py-1.5 text-[9px] tracking-widest font-black uppercase text-slate-500">Provider</div>
                                        <div className="px-2.5 py-1 text-xs font-bold capitalize text-slate-300">
                                            {chatSettings.provider} AI Node
                                        </div>
                                        <div className="my-1.5 border-t border-slate-800/20 dark:border-white/5" />
                                        <button
                                            onClick={() => {
                                                setShowOfflineGuide(!showOfflineGuide);
                                                setShowMoreActions(false);
                                            }}
                                            className={`flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-bold transition-colors ${
                                                isDarkMode ? "text-slate-400 hover:bg-slate-900/60 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <HelpCircle className="h-4 w-4 text-purple-400" />
                                            <span>Setup Local Node</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
            {chatSettings.provider === "offline" && (
                <ChatModePanel isDarkMode={isDarkMode} settings={chatSettings} />
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent relative">
                
                {/* main Conversational Area */}
                <div data-lenis-prevent className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pt-5 pb-8 sm:px-5 sm:pt-6 relative z-10 flex flex-col">
                    {messages.length === 0 ? (
                        /* Cinematic Empty State Hero Showcase */
                        <div className="flex min-h-full flex-col items-center justify-center pt-8 pb-24 max-w-4xl mx-auto w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center justify-center w-full"
                            >
                            {/* Quantum AI Core Orb Hero */}
                            <KittyBot scale={1.2} isThinking={isLoading} activeMode={activeMode} />
                            
                            <motion.h2
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-8 text-center text-4xl font-black tracking-tight text-gradient animate-float"
                            >
                                How can I help you today?
                            </motion.h2>
                            
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className={`mb-10 mt-4 max-w-xl text-center text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                            >
                                Powered by <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{chatSettings.provider === "offline" ? "Offline local nodes" : "Google Gemini Cloud"}</span>. Currently optimized for <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{MODES[activeMode].label}</span>.
                            </motion.p>

                            {/* Adaptive Mode Command Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                className="grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-4 px-2"
                            >
                                {Object.values(MODES).map((mode) => {
                                    const isCurrent = activeMode === mode.id;
                                    return (
                                        <motion.button
                                            key={mode.id}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveMode(mode.id)}
                                            className={`relative rounded-2xl border p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                                                isCurrent
                                                    ? isDarkMode 
                                                        ? "border-purple-500/50 bg-gradient-to-br from-slate-900/90 to-purple-950/20 text-white shadow-xl shadow-purple-500/10" 
                                                        : "border-purple-200 bg-white text-slate-900 shadow-md shadow-purple-500/5"
                                                    : isDarkMode 
                                                        ? "glass-panel-dark text-slate-400 border-slate-900 hover:border-slate-800 hover:text-white" 
                                                        : "glass-panel text-slate-500 border-slate-200/80 hover:border-slate-300 hover:text-slate-950"
                                            }`}
                                        >
                                            {isCurrent && (
                                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                            )}
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mode.bgColor} border ${mode.borderColor} shadow-inner`}>
                                                <mode.icon className={`h-5 w-5 ${mode.iconColor}`} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">{mode.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Offline Setup Accordion */}
                            <div className="w-full max-w-2xl mt-6 px-2">
                                <button 
                                    onClick={() => setShowOfflineGuide(!showOfflineGuide)}
                                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? "border-slate-900 bg-slate-950/40 hover:bg-slate-900/60" : "border-slate-200 bg-white/40 hover:bg-slate-100/60"}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-purple-400" />
                                        Setup Offline local Llama nodes
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showOfflineGuide ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {showOfflineGuide && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <OfflineSetupGuide isDarkMode={isDarkMode} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Starter prompt shortcuts */}
                            <div className="mt-10 flex w-full max-w-2xl flex-col sm:flex-row justify-center gap-3 px-4">
                                {starterPrompts.map((prompt) => (
                                    <motion.button
                                        key={prompt}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setInput(prompt)}
                                        className={`rounded-2xl border p-4 text-xs font-bold text-left leading-relaxed transition-all shadow-sm ${
                                            isDarkMode 
                                                ? "border-slate-900 bg-slate-950/50 text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-800" 
                                                : "border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                        }`}
                                    >
                                        {prompt}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* Centered Modern Message List */
                    <div className="mx-auto w-full max-w-4xl space-y-8 px-3 pb-32 sm:px-5 relative z-10">
                        <AnimatePresence mode="popLayout">
                                {messages.map((msg, idx) => {
                                    const isUser = msg.role === "user";
                                    const messageId = msg._id || `msg-${idx}`;
                                    
                                    return (
                                        <motion.div
                                            key={messageId}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.45, type: "spring", stiffness: 350, damping: 30 }}
                                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            {isUser ? (
                                                <div className="flex w-full gap-3.5 justify-end items-start">
                                                    {/* Chat bubble element */}
                                                    <div className="flex flex-col items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                                                        <div className={`rounded-[2rem] rounded-tr-sm px-6 py-4.5 text-left text-white font-medium shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-0 bg-gradient-to-br ${MODES[activeMode].color}`}>
                                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                                                        </div>
                                                    </div>

                                                    {/* Glowing User Avatar */}
                                                    <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border text-sm shadow-sm transition-all duration-300 ${
                                                        isDarkMode
                                                            ? "border-slate-800 bg-slate-900 text-purple-400"
                                                            : "border-slate-200 bg-white text-purple-650 shadow-sm"
                                                    }`}>
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex w-full gap-3.5 justify-start items-start">
                                                    {/* Glowing AI Bot Avatar */}
                                                    <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border text-sm shadow-sm transition-all duration-300 ${
                                                        isDarkMode
                                                            ? "border-slate-800 bg-slate-900 text-purple-400"
                                                            : "border-slate-200 bg-white text-purple-650 shadow-sm"
                                                    }`}>
                                                        <Bot className="h-4 w-4 text-purple-400" />
                                                    </div>

                                                    {/* Elevated AI glassmorphic message card layout */}
                                                    <div className={`flex-1 rounded-3xl rounded-tl-sm px-6 py-5 border shadow-sm max-w-[85%] sm:max-w-[75%] relative group/message transition-all duration-300 ${
                                                        isDarkMode
                                                            ? "bg-slate-900/40 border-slate-900/80 text-slate-150"
                                                            : "bg-white/85 border-slate-200/60 text-slate-800 shadow-slate-100"
                                                    }`}>
                                                        
                                                        {editingMessageId === msg._id ? (
                                                            <div className="flex flex-col gap-2">
                                                                <textarea
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    className={`min-h-24 w-full resize-y rounded-xl border p-3.5 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500/20 ${
                                                                        isDarkMode ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"
                                                                    }`}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            onUpdateMessage?.(msg._id, editingText);
                                                                            setEditingMessageId(null);
                                                                        }}
                                                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-500"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" />
                                                                        Save Changes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingMessageId(null)}
                                                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                                                            isDarkMode ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                                        }`}
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={`prose prose-sm sm:prose-base max-w-none break-words ${isDarkMode ? "prose-invert" : ""}`}>
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        code({ node, className, children, ...props }) {
                                                                            const match = /language-(\w+)/.exec(className || "");
                                                                            const isInline = !match && !String(children).includes('\n');
                                                                            const codeContent = String(children).replace(/\n$/, "");
                                                                            return !isInline && match ? (
                                                                                <div className={`relative group/code my-5 rounded-2xl border overflow-hidden shadow-xl ${
                                                                                    isDarkMode ? 'bg-slate-950 border-slate-900/60 shadow-black/40' : 'bg-slate-50 border-slate-200 shadow-slate-100'
                                                                                }`}>
                                                                                   <div className={`flex items-center justify-between px-4 py-3 text-xs border-b ${
                                                                                       isDarkMode ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200"
                                                                                   }`}>
                                                                                       <div className="flex items-center gap-1.5">
                                                                                           <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                                                                           <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                                                                           <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                                                                           <span className={`ml-2.5 font-bold uppercase tracking-widest text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                                               {match[1]}
                                                                                           </span>
                                                                                       </div>
                                                                                       
                                                                                       <button 
                                                                                           onClick={() => handleCopyText(codeContent, messageId)} 
                                                                                           className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] tracking-widest uppercase font-black transition-all ${
                                                                                               isDarkMode 
                                                                                                   ? 'text-slate-400 hover:text-white hover:bg-slate-900' 
                                                                                                   : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                                                                           }`}
                                                                                       >
                                                                                           {copiedId === messageId ? (
                                                                                               <>
                                                                                                   <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                                                                   <span className="text-emerald-400">Copied!</span>
                                                                                               </>
                                                                                           ) : (
                                                                                               <>
                                                                                                   <Copy className="w-3 h-3" />
                                                                                                   <span>Copy</span>
                                                                                               </>
                                                                                           )}
                                                                                       </button>
                                                                                   </div>
                                                                                   <SyntaxHighlighter
                                                                                       style={isDarkMode ? vscDarkPlus : coy}
                                                                                       language={match[1]}
                                                                                       PreTag="div"
                                                                                       customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}
                                                                                       {...props}
                                                                                   >
                                                                                       {codeContent}
                                                                                   </SyntaxHighlighter>
                                                                                </div>
                                                                            ) : (
                                                                                <code className={`${className} bg-purple-500/10 text-purple-400 dark:text-purple-300 px-1.5 py-0.5 rounded text-[13px] font-mono`} {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            );
                                                                        },
                                                                        table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full divide-y divide-slate-800 border border-slate-800 rounded-xl" {...props} /></div>,
                                                                        th: ({node, ...props}) => <th className="px-5 py-3 bg-slate-900 text-left text-xs font-black uppercase tracking-widest text-slate-400" {...props} />,
                                                                        td: ({node, ...props}) => <td className="px-5 py-3 border-t border-slate-800 text-sm font-semibold" {...props} />
                                                                    }}
                                                                >
                                                                    {msg.text}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
 
                                                        {/* Modern inline Micro-action row below plain text */}
                                                        <div className="flex items-center gap-3.5 mt-4 pl-1 md:opacity-0 md:group-hover/message:opacity-100 focus-within:opacity-100 transition-opacity">
                                                            
                                                            {/* Copy button */}
                                                            <button
                                                                onClick={() => handleCopyText(msg.text, msg._id)}
                                                                className={`rounded-lg p-1.5 transition-colors ${
                                                                    isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                                                                }`}
                                                                title="Copy Response"
                                                            >
                                                                {copiedId === msg._id ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                                            </button>
 
                                                            {/* Thumbs Up Rating */}
                                                            <button
                                                                onClick={() => handleRateMessage(msg._id, "up")}
                                                                className={`rounded-lg p-1.5 transition-colors ${
                                                                    ratings[msg._id] === "up" 
                                                                        ? "text-emerald-400" 
                                                                        : isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                                                                }`}
                                                                title="Good Response"
                                                            >
                                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                            </button>
 
                                                            {/* Thumbs Down Rating */}
                                                            <button
                                                                onClick={() => handleRateMessage(msg._id, "down")}
                                                                className={`rounded-lg p-1.5 transition-colors ${
                                                                    ratings[msg._id] === "down" 
                                                                        ? "text-red-400" 
                                                                        : isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                                                                }`}
                                                                title="Bad Response"
                                                            >
                                                                <ThumbsDown className="h-3.5 w-3.5" />
                                                            </button>
 
                                                            {/* Delete mock buttons for administrator */}
                                                            {user && (
                                                                <button
                                                                    onClick={() => onDeleteMessage?.(msg._id)}
                                                                    className="rounded-lg p-1.5 transition-colors text-red-500/60 hover:text-red-500"
                                                                    title="Remove Response"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
 
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Thinking/loading animated indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                    className="flex w-full justify-start mt-6"
                                >
                                    <div className="flex w-full gap-3.5 justify-start items-start">
                                        {/* Glowing AI Bot Avatar */}
                                        <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border text-sm shadow-sm transition-all duration-300 ${
                                            isDarkMode
                                                ? "border-slate-800 bg-slate-900 text-purple-400"
                                                : "border-slate-200 bg-white text-purple-650 shadow-sm"
                                        }`}>
                                            <Bot className="h-4 w-4 animate-pulse text-purple-450" />
                                        </div>

                                        <div className={`flex flex-col gap-3 max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tl-sm px-6 py-5 border shadow-sm ${
                                            isDarkMode
                                                ? "bg-slate-900/40 border-slate-900/80 text-slate-150"
                                                : "bg-white/85 border-slate-200/60 text-slate-800 shadow-slate-100"
                                        }`}>
                                             <div className="flex items-center gap-3">
                                                 <div className="flex gap-1.5 items-center">
                                                     {[0, 0.15, 0.3].map((delay) => (
                                                         <motion.div
                                                             key={delay}
                                                             animate={{ 
                                                                 scale: [1, 1.3, 1], 
                                                                 opacity: [0.45, 1, 0.45],
                                                             }}
                                                             transition={{ repeat: Infinity, duration: 1.0, delay }}
                                                             className={`h-2 w-2 rounded-full bg-gradient-to-r ${MODES[activeMode].color}`}
                                                         />
                                                     ))}
                                                 </div>
                                                 <span className={`text-[9px] font-black uppercase tracking-wider animate-pulse ${isDarkMode ? "text-purple-400" : "text-purple-650"}`}>
                                                     {isTyping ? "Operator Thinking" : "Synthesizing Output"}
                                                 </span>
                                             </div>

                                             <div className="flex items-end gap-1 h-5 px-1 pt-1 opacity-70">
                                                 {[...Array(10)].map((_, i) => (
                                                     <span
                                                         key={i}
                                                         className="soundwave-bar-mini"
                                                         style={{
                                                             animationDelay: `${i * 0.07}s`,
                                                             height: '4px'
                                                         }}
                                                     />
                                                 ))}
                                             </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Glass Input Deck Floating Dock */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t ${
                    isDarkMode ? "from-slate-950 via-slate-950/95" : "from-slate-50 via-slate-50/95"
                } to-transparent pointer-events-none z-20`}>
                    <div className="mx-auto flex max-w-3xl flex-col gap-4 pointer-events-auto px-2 sm:px-4">
                        
                        {/* Mode quick selection capsule bar inside input zone */}
                        {messages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="scrollbar-none flex gap-2 overflow-x-auto pb-1 mx-auto justify-center"
                            >
                                {Object.values(MODES).map((mode) => {
                                    const isCurrent = activeMode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setActiveMode(mode.id)}
                                            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                                isCurrent
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/60 text-white shadow-[0_0_18px_rgba(168,85,247,0.45)] scale-[1.03]"
                                                    : isDarkMode ? "border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-200 hover:bg-slate-900" : "border-slate-200 bg-white/60 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            <mode.icon className={`h-3.5 w-3.5 ${isCurrent ? "text-white animate-pulse" : mode.iconColor}`} />
                                            <span>{mode.label}</span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {/* Floating Expert presets deck */}
                        <AnimatePresence>
                            {input.trim().length > 0 && !input.startsWith("Act as a") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                                    className="mx-auto flex w-full max-w-4xl overflow-x-auto scrollbar-none gap-2 pb-1 relative z-10 px-2 justify-center"
                                >
                                    {expertPrompts.map((p, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => setInput(p.text + input.trim())}
                                            className={`flex whitespace-nowrap shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-wider shadow-md border transition-all ${
                                                isDarkMode 
                                                    ? "bg-slate-900 text-purple-300 border-slate-800 hover:bg-slate-800 hover:text-white" 
                                                    : "bg-white text-purple-600 border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Sparkle className="h-3 w-3 text-purple-400 animate-pulse" />
                                            <span>{p.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Redesigned Single-Row Inline Input Pill */}
                        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
                            <div className={`mx-auto flex w-full max-w-3xl items-center gap-2.5 rounded-[2rem] border px-4 py-1.5 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-purple-500/20 ${
                                isDarkMode 
                                    ? "glass-panel-dark border-slate-850 bg-[#0d1222]/85" 
                                    : "glass-panel border-slate-200 bg-white/95"
                            }`}>
                                {/* Far Left: Plus attachment button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className={`rounded-full p-2.5 transition-colors hover:bg-slate-800/10 dark:hover:bg-white/10 shrink-0 ${
                                        isDarkMode ? "text-slate-450 hover:text-white" : "text-slate-500 hover:text-slate-950"
                                    }`}
                                    title="Attach logs or files"
                                >
                                    <Plus className="h-4.5 w-4.5" />
                                </motion.button>

                                {/* Middle Auto-growing Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (input.trim() && !isLoading) {
                                                onSend();
                                            }
                                        }
                                    }}
                                    placeholder={`Message your AI Core (${MODES[activeMode].label})...`}
                                    rows={1}
                                    className={`flex-1 max-h-[160px] resize-none bg-transparent py-2.5 text-[15px] font-medium outline-none placeholder:text-slate-500/80 scrollbar-none ${
                                        isDarkMode ? "text-white" : "text-slate-800"
                                    }`}
                                    style={{ minHeight: '40px' }}
                                />

                                {/* Right: Voice dictate & Circular Send trigger */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        className={`rounded-full p-2.5 transition-colors hover:bg-slate-800/10 dark:hover:bg-white/10 ${
                                            isDarkMode ? "text-slate-455 hover:text-white" : "text-slate-500 hover:text-slate-955"
                                        }`}
                                        title="Voice dictation"
                                    >
                                        <Mic className="h-4.5 w-4.5" />
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onSend}
                                        disabled={!input.trim() || isLoading}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                                            input.trim() && !isLoading
                                                ? "bg-white text-slate-900 shadow-md hover:scale-105"
                                                : isDarkMode 
                                                    ? "bg-slate-850 text-slate-655 border border-slate-800" 
                                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                        }`}
                                        title="Dispatch Query"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Small Disclaimer text underneath the pill */}
                            <p className={`text-[10px] text-center font-bold tracking-wide mt-1 opacity-60 ${
                                isDarkMode ? "text-slate-500" : "text-slate-455"
                            }`}>
                                Chatterbot can make mistakes. Consider checking important information.
                            </p>

                            {/* Premium Bottom Metadata Status Bar */}
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2.5 pt-2 border-t border-slate-900/10 dark:border-white/5 max-w-2xl mx-auto w-full">
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>SYSTEM FUNCTIONAL</span>
                                </div>
                                <div className={`h-3 w-px ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    <Sparkle className="h-3 w-3 text-purple-400 animate-pulse" />
                                    <span>16K CONTEXT NODE</span>
                                </div>
                                <div className={`h-3 w-px ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    {chatSettings.provider === "offline" ? (
                                        <>
                                            <HardDrive className="h-3 w-3 text-purple-400" />
                                            <span>OLLAMA ENGINE SYSTEM</span>
                                        </>
                                    ) : (
                                        <>
                                            <Cloud className="h-3 w-3 text-purple-400" />
                                            <span>GEMINI VAULT INTELLIGENCE</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Scroll-adaptive Header model panel
const ChatModePanel = ({ isDarkMode, settings }) => {
    const {
        provider,
        setProvider,
        ollamaModel,
        setOllamaModel,
        customOllamaModel,
        setCustomOllamaModel,
        ollamaModels,
        ollamaStatus,
        isOllamaLoading,
        ollamaError,
        refreshOllama,
    } = settings;

    const statusColor = ollamaStatus.running ? "text-emerald-400 font-extrabold" : "text-red-400 font-extrabold";
    const StatusIcon = ollamaStatus.running ? Wifi : WifiOff;

    return (
        <div className={`border-b p-4 relative z-30 transition-all duration-300 ${
            provider === "online" ? "sm:hidden" : ""
        } ${isDarkMode ? "glass-navbar-dark border-slate-900" : "glass-navbar border-slate-200/80"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto">
                
                {/* switch Cloud vs Local Toggle Pill */}
                <div className={`sm:hidden grid grid-cols-2 rounded-xl border p-1 max-w-xs ${
                    isDarkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-slate-50"
                }`}>
                    <button
                        type="button"
                        onClick={() => setProvider("online")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                            provider === "online" 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/60 text-white shadow-[0_0_18px_rgba(168,85,247,0.45)] scale-[1.02]" 
                                : isDarkMode ? "border-transparent text-slate-400 hover:bg-slate-900 hover:text-white" : "border-transparent text-slate-600 hover:bg-white"
                        }`}
                    >
                        <Cloud className="h-4 w-4" />
                        <span>Cloud AI</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setProvider("offline")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                            provider === "offline" 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/60 text-white shadow-[0_0_18px_rgba(168,85,247,0.45)] scale-[1.02]" 
                                : isDarkMode ? "border-transparent text-slate-400 hover:bg-slate-900 hover:text-white" : "border-transparent text-slate-600 hover:bg-white"
                        }`}
                    >
                        <HardDrive className="h-4 w-4" />
                        <span>Local Node</span>
                    </button>
                </div>

                {/* Model Configuration Dropdown (Local Offline mode only) */}
                {provider === "offline" && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest ${statusColor}`}>
                            <StatusIcon className="h-4 w-4 animate-pulse" />
                            <span>{ollamaStatus.running ? "Ollama Engine Ready" : "Ollama Engine Offline"}</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={refreshOllama}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <RefreshCw className={`h-4 w-4 ${isOllamaLoading ? "animate-spin" : ""}`} />
                            <span>Sync Nodes</span>
                        </motion.button>

                        <div className={`flex items-center overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-purple-500/20 transition-all ${
                            isDarkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
                        }`}>
                            <select
                                value={ollamaModel}
                                onChange={(e) => setOllamaModel(e.target.value)}
                                disabled={!ollamaModels.length || Boolean(customOllamaModel.trim())}
                                className={`h-10 border-r px-3.5 text-xs font-bold outline-none bg-transparent disabled:opacity-50 ${
                                    isDarkMode ? "border-slate-800 text-white" : "border-slate-200 text-slate-800"
                                }`}
                            >
                                <option value="" className={isDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>Select model tag...</option>
                                {ollamaModels.map((model) => (
                                    <option key={model.name} value={model.name} className={isDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>{model.name}</option>
                                ))}
                            </select>

                            <input
                                value={customOllamaModel}
                                onChange={(e) => setCustomOllamaModel(e.target.value)}
                                placeholder="Or direct tags (e.g. gemma2)"
                                className={`h-10 w-44 bg-transparent px-3 text-xs font-bold outline-none ${
                                    isDarkMode ? "text-white placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"
                                }`}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Error notifications */}
            {provider === "offline" && (ollamaError || !ollamaStatus.running || ollamaModels.length === 0) && (
                <div className={`mt-4 rounded-xl border p-3 text-xs font-semibold flex items-center gap-2 max-w-7xl mx-auto ${
                    isDarkMode ? "border-red-500/20 bg-red-500/5 text-red-300" : "border-red-200 bg-red-50 text-red-700"
                }`}>
                    <X className="w-4 h-4 shrink-0" />
                    <span>{ollamaError || "Ensure local Ollama process is booted and model tags are pulled."}</span>
                </div>
            )}
        </div>
    );
};

const OfflineSetupGuide = ({ isDarkMode }) => {
    return (
        <div className={`mt-4 rounded-2xl border p-5 text-left transition-all ${
            isDarkMode 
                ? "border-purple-500/10 bg-purple-500/5 text-slate-300" 
                : "border-purple-200 bg-purple-50/50 text-slate-700"
        }`}>
            <p className="text-xs opacity-90 mb-4 leading-relaxed font-semibold">
                Ollama allows you to deploy state-of-the-art weights (Llama 3, Gemma) locally on your GPU. Follow this terminal playbook to synchronize nodes:
            </p>
            <ol className="space-y-4 text-xs font-medium">
                <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400 font-bold">1</span>
                        <span>Download Ollama installer from</span>
                    </div>
                    <a className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors font-extrabold ml-8 sm:ml-0" href="https://ollama.com/download" target="_blank" rel="noreferrer">ollama.com</a>
                </li>
                <li className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400 font-bold">2</span>
                        <span>Boot local core server in background:</span>
                    </div>
                    <div className="ml-8">
                        <CopyableCommand command="ollama serve" isDarkMode={isDarkMode} />
                    </div>
                </li>
                <li className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400 font-bold">3</span>
                        <span>Pull LLM model parameter tag:</span>
                    </div>
                    <div className="ml-8">
                        <CopyableCommand command="ollama pull llama3" isDarkMode={isDarkMode} />
                    </div>
                </li>
                <li className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400 font-bold">4</span>
                        <span>Switch active AI Provider at the top to <strong className="text-purple-400 font-black">Local Node</strong> to route queries to Ollama.</span>
                    </div>
                </li>
            </ol>
        </div>
    );
};

const CopyableCommand = ({ command, isDarkMode }) => {
    const [copied, setCopied] = useState(false);

    const copyCommand = async () => {
        await navigator.clipboard?.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex items-center gap-3 rounded-xl border p-3.5 max-w-md ${
            isDarkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
        }`}>
            <code className="min-w-0 flex-1 overflow-x-auto text-[11px] font-mono tracking-wide">{command}</code>
            <button
                type="button"
                onClick={copyCommand}
                className={`rounded-lg p-2 transition-colors border ${
                    isDarkMode 
                        ? "border-slate-800 bg-slate-950 text-slate-400 hover:text-white" 
                        : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                }`}
                title="Copy Command"
            >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
        </div>
    );
};

export default ChatInterface;



