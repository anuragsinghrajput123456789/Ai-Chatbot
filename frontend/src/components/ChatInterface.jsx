import React, { useRef, useEffect } from "react";
import { User, Bot, Mic, Sparkle, Send, Cloud, HardDrive, RefreshCw, Copy, Wifi, WifiOff, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import KittyBot from "./KittyBot";
import { MODES } from "../constants";
import { useChatSettings } from "../context/ChatSettingsContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, coy } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    onDeleteMessage
}) => {
    const messagesEndRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = React.useState(null);
    const [editingText, setEditingText] = React.useState("");
    const chatSettings = useChatSettings();
    const starterPrompts = [
        "Help me write a professional email",
        "Explain JavaScript promises simply",
        "Give me 5 creative project ideas",
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, user]);

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col h-full bg-transparent">
            <div className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent`}>
                <ChatModePanel isDarkMode={isDarkMode} settings={chatSettings} />

                <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex min-h-full flex-col items-center justify-center py-8"
                        >
                            <KittyBot scale={1.15} isThinking={isLoading} />
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="mt-6 text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                            >
                                Hello, {user?.username || "guest"}!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className={`mb-7 mt-3 max-w-sm text-center text-base sm:text-lg ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                            >
                                I'm in <span className="font-semibold text-purple-400">{MODES[activeMode].label}</span> mode using <span className="font-semibold text-purple-400">{chatSettings.provider === "offline" ? "Offline Ollama" : "Online Gemini"}</span>. {user ? "Your history is saved." : "You can chat without an account."}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2"
                            >
                                {Object.values(MODES).map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setActiveMode(mode.id)}
                                        className={`group relative flex-1 min-w-[120px] rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${activeMode === mode.id
                                            ? `${isDarkMode ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-white shadow-lg shadow-purple-500/20" : "border-purple-500/30 bg-purple-50 text-purple-950 shadow-md"}`
                                            : `${isDarkMode ? "glass-panel-dark text-slate-300 hover:border-slate-700" : "glass-panel text-slate-700 hover:border-slate-300"}`
                                            }`}
                                    >
                                        <div className="relative flex flex-col items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${mode.bgColor} border ${mode.borderColor}`}>
                                                <mode.icon className={`h-5 w-5 ${mode.iconColor}`} />
                                            </div>
                                            <span className="text-sm font-medium">{mode.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>

                            {chatSettings.provider === "offline" && (
                                <OfflineSetupGuide isDarkMode={isDarkMode} />
                            )}

                            <div className="mt-6 flex w-full max-w-2xl flex-wrap justify-center gap-2">
                                {starterPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => setInput(prompt)}
                                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-5 pb-4">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={msg._id || idx}
                                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className={`flex max-w-[92%] gap-3 sm:max-w-[78%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm sm:h-10 sm:w-10 ${msg.role === "user" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" : "border border-slate-700 bg-slate-900 text-white"}`}>
                                                {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                            </div>

                                            <div className={`group/message relative overflow-hidden rounded-3xl border px-5 py-4 text-[15px] leading-relaxed sm:px-6 ${msg.role === "user"
                                                ? "rounded-tr-sm border-purple-500/40 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                                                : isDarkMode
                                                    ? "rounded-tl-sm glass-panel-dark text-slate-200 shadow-md"
                                                    : "rounded-tl-sm glass-panel text-slate-800 shadow-md"
                                                }`}
                                            >
                                                {editingMessageId === msg._id ? (
                                                    <textarea
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        className={`min-h-24 w-full resize-y rounded-lg border p-3 text-sm outline-none ${isDarkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"}`}
                                                    />
                                                ) : msg.role === "model" ? (
                                                    <div className={`prose prose-sm sm:prose-base max-w-none break-words ${isDarkMode ? "prose-invert" : ""}`}>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ node, inline, className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || "");
                                                                    return !inline && match ? (
                                                                        <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-700">
                                                                           <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 text-slate-300 text-xs font-mono border-b border-slate-700">
                                                                               <span>{match[1]}</span>
                                                                               <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"><Copy className="w-3 h-3"/> Copy</button>
                                                                           </div>
                                                                           <SyntaxHighlighter
                                                                               style={isDarkMode ? vscDarkPlus : coy}
                                                                               language={match[1]}
                                                                               PreTag="div"
                                                                               customStyle={{ margin: 0, padding: '1rem', background: isDarkMode ? '#1e1e1e' : '#f8f9fa' }}
                                                                               {...props}
                                                                           >
                                                                               {String(children).replace(/\n$/, "")}
                                                                           </SyntaxHighlighter>
                                                                        </div>
                                                                    ) : (
                                                                        <code className={`${className} bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    );
                                                                },
                                                                table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-700 border border-slate-700 rounded-lg" {...props} /></div>,
                                                                th: ({node, ...props}) => <th className="px-4 py-2 bg-slate-800/50 text-left text-sm font-semibold text-slate-300" {...props} />,
                                                                td: ({node, ...props}) => <td className="px-4 py-2 border-t border-slate-700/50 text-sm" {...props} />
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                                )}
                                                <div className={`mt-2 text-xs opacity-70 ${msg.role === "user" ? "text-right text-purple-200" : isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                <div className={`mt-3 flex items-center gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                    {editingMessageId === msg._id ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onUpdateMessage?.(msg._id, editingText);
                                                                    setEditingMessageId(null);
                                                                }}
                                                                className="rounded-md bg-emerald-600 p-1.5 text-white transition-colors hover:bg-emerald-500"
                                                                title="Save message"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingMessageId(null)}
                                                                className={`rounded-md p-1.5 transition-colors ${isDarkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                                                                title="Cancel edit"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingMessageId(msg._id);
                                                                    setEditingText(msg.text);
                                                                }}
                                                                className={`rounded-md p-1.5 opacity-80 transition-colors hover:opacity-100 ${isDarkMode ? "bg-slate-700/70 text-slate-200 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                                                                title="Edit message"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onDeleteMessage?.(msg._id)}
                                                                className="rounded-md bg-red-500/15 p-1.5 text-red-300 transition-colors hover:bg-red-500/25"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex w-full justify-start"
                                >
                                    <div className="ml-12 flex items-center gap-3">
                                        <div className={`flex gap-2 rounded-2xl rounded-tl-sm border px-4 py-3 ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                                            {[0, 0.2, 0.4].map((delay) => (
                                                <motion.div
                                                    key={delay}
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                                                    className="h-2 w-2 rounded-full bg-purple-400"
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                            {isTyping ? "Thinking..." : "Generating response..."}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className={`mt-auto border-t p-3 sm:p-4 ${isDarkMode ? "border-slate-800/50 bg-slate-950/70" : "border-slate-200/50 bg-white/70"} backdrop-blur-md`}>
                    <div className="mx-auto flex max-w-4xl flex-col gap-3">
                        {messages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
                            >
                                {Object.values(MODES).map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setActiveMode(mode.id)}
                                        className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeMode === mode.id
                                            ? `${isDarkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-slate-100 text-slate-950"}`
                                            : `${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`
                                            }`}
                                    >
                                        <mode.icon className={`h-4 w-4 ${mode.iconColor}`} />
                                        <span>{mode.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        <div className={`flex items-end gap-2 rounded-[2rem] border p-2 pl-4 shadow-sm transition-all focus-within:ring-4 focus-within:ring-purple-500/30 focus-within:border-purple-500/50 sm:gap-3 ${isDarkMode ? "glass-panel-dark" : "glass-panel"}`}>
                            <button
                                type="button"
                                className={`rounded-lg p-2.5 transition-colors ${isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-purple-300" : "text-slate-500 hover:bg-white hover:text-purple-600"}`}
                                title="Voice input"
                            >
                                <Mic className="h-5 w-5" />
                            </button>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        onSend();
                                    }
                                }}
                                placeholder={`Ask ${MODES[activeMode].label}...`}
                                rows={1}
                                className={`max-h-32 min-h-11 flex-1 resize-none bg-transparent px-1 py-3 text-base outline-none placeholder:text-slate-400 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                            />

                            <button
                                type="button"
                                className={`hidden rounded-lg p-2.5 transition-colors sm:inline-flex ${isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-blue-300" : "text-slate-500 hover:bg-white hover:text-blue-600"}`}
                                title="Improve prompt"
                            >
                                <Sparkle className="h-5 w-5" />
                            </button>

                                <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={onSend}
                                disabled={!input.trim() || isLoading}
                                className={`rounded-full p-3.5 transition-all duration-300 ${input.trim() && !isLoading
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                    : isDarkMode ? "bg-slate-800 text-slate-600" : "bg-slate-200 text-slate-400"
                                    }`}
                                title="Send message"
                            >
                                <Send className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    const statusColor = ollamaStatus.running ? "text-emerald-400" : "text-red-400";
    const StatusIcon = ollamaStatus.running ? Wifi : WifiOff;

    return (
        <div className={`border-b p-3 sm:p-4 ${isDarkMode ? "glass-navbar-dark" : "glass-navbar"}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className={`grid grid-cols-2 rounded-xl border p-1 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
                    <button
                        type="button"
                        onClick={() => setProvider("online")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${provider === "online" ? "bg-purple-600 text-white" : isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-white"}`}
                    >
                        <Cloud className="h-4 w-4" />
                        Online
                    </button>
                    <button
                        type="button"
                        onClick={() => setProvider("offline")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${provider === "offline" ? "bg-purple-600 text-white" : isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-white"}`}
                    >
                        <HardDrive className="h-4 w-4" />
                        Offline
                    </button>
                </div>

                {provider === "offline" && (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className={`inline-flex items-center gap-2 text-sm ${statusColor}`}>
                            <StatusIcon className="h-4 w-4" />
                            {ollamaStatus.running ? "Ollama running" : "Ollama not running"}
                        </div>

                        <button
                            type="button"
                            onClick={refreshOllama}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isDarkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                            <RefreshCw className={`h-4 w-4 ${isOllamaLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>

                        <select
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            disabled={!ollamaModels.length || Boolean(customOllamaModel.trim())}
                            className={`min-h-10 rounded-lg border px-3 text-sm outline-none disabled:opacity-50 ${isDarkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}
                        >
                            <option value="">Select model</option>
                            {ollamaModels.map((model) => (
                                <option key={model.name} value={model.name}>{model.name}</option>
                            ))}
                        </select>

                        <input
                            value={customOllamaModel}
                            onChange={(e) => setCustomOllamaModel(e.target.value)}
                            placeholder="Custom model"
                            className={`min-h-10 rounded-lg border px-3 text-sm outline-none ${isDarkMode ? "border-slate-800 bg-slate-900 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"}`}
                        />
                    </div>
                )}
            </div>

            {provider === "offline" && (ollamaError || !ollamaStatus.running || ollamaModels.length === 0) && (
                <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${isDarkMode ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {ollamaError || "Please start Ollama locally to use offline mode."}
                </div>
            )}
        </div>
    );
};

const OfflineSetupGuide = ({ isDarkMode }) => {
    const commands = [
        "ollama serve",
        "ollama pull llama3",
        "ollama pull mistral",
        "ollama list",
    ];

    return (
        <div className={`mt-6 w-full max-w-2xl rounded-xl border p-4 text-left ${isDarkMode ? "border-slate-800 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
            <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-950"}`}>Run Offline Mode</h3>
            <ol className="mt-3 space-y-3 text-sm">
                <li>1. Install Ollama from <a className="text-purple-400 underline" href="https://ollama.com/download" target="_blank" rel="noreferrer">ollama.com/download</a>.</li>
                <li>2. Start Ollama locally.</li>
                <li>3. Pull at least one model.</li>
                <li>4. Verify your local models.</li>
            </ol>
            <div className="mt-4 space-y-2">
                {commands.map((command) => (
                    <CopyableCommand key={command} command={command} isDarkMode={isDarkMode} />
                ))}
            </div>
        </div>
    );
};

const CopyableCommand = ({ command, isDarkMode }) => {
    const copyCommand = async () => {
        await navigator.clipboard?.writeText(command);
    };

    return (
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <code className="min-w-0 flex-1 overflow-x-auto text-sm">{command}</code>
            <button
                type="button"
                onClick={copyCommand}
                className={`rounded-md p-2 transition-colors ${isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                title="Copy command"
            >
                <Copy className="h-4 w-4" />
            </button>
        </div>
    );
};

export default ChatInterface;
