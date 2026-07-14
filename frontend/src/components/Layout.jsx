import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
    MessageSquarePlus, MessageSquare, Trash2, Edit2, Menu, X, Check, XCircle, Search, 
    Bot, LogOut, Home, HardDrive, Cloud, User as UserIcon, Sparkles, Plus, Settings, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatSettings } from "../context/ChatSettingsContext";

const AVATARS = ["Bot", "User", "🤖", "😎", "🐱", "🚀", "🧑‍💻", "🦄", "🐼"];

const Layout = ({ 
    children, 
    isDarkMode, 
    toggleDarkMode, 
    activeMode, 
    user, 
    onLogout, 
    onClearChat, 
    onChangeAvatar,
    chatList,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChatSession,
    onRenameChatSession 
}) => {
    const { provider, setProvider, ollamaStatus } = useChatSettings();
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const profileMenuRef = useRef(null);

    const filteredChatList = chatList?.filter(chat => 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close profile popover on outside click
    useEffect(() => {
        if (!showProfileMenu) return;
        const handler = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
                setShowAvatarSelect(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showProfileMenu]);

    const startEditing = (chat) => {
        setEditingChatId(chat._id);
        setEditTitle(chat.title);
    };

    const saveEdit = () => {
        if (editTitle.trim()) {
            onRenameChatSession(editingChatId, editTitle);
        }
        setEditingChatId(null);
    };

    const cancelEdit = () => {
        setEditingChatId(null);
        setEditTitle("");
    };

    // Mode configuration class mapping for theme adaptation
    const modeThemes = {
        chat: "theme-chat",
        code: "theme-code",
        study: "theme-study",
        creative: "theme-creative"
    };
    const currentThemeClass = modeThemes[activeMode] || "theme-chat";

    const renderProfileAvatar = () => {
        if (!user) return <UserIcon className="h-5 w-5 text-purple-500" />;
        const avatarStr = user.avatar || "User";
        if (avatarStr === "Bot") return <Bot className="h-5 w-5 text-purple-500" />;
        if (avatarStr === "User") return <UserIcon className="h-5 w-5 text-purple-500" />;
        return <span className="text-base font-black leading-none">{avatarStr}</span>;
    };

    const handleSelectAvatar = (avatar) => {
        if (onChangeAvatar) onChangeAvatar(avatar);
        setShowAvatarSelect(false);
    };

    return (
        <div className={`flex h-[100dvh] w-full overflow-hidden transition-colors duration-500 relative z-10 ${currentThemeClass} ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
            
            {/* Immersive cinematic grid background with slow pan animation */}
            <div className="cinematic-grid animate-grid-pan" />

            {/* Glowing active mode drifting backdrops that shift with selection */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div 
                    className="absolute top-[-20%] left-[5%] w-[650px] h-[650px] rounded-full opacity-[0.32] dark:opacity-[0.24] animate-drift-bg-mesh transition-all duration-1000" 
                    style={{ 
                        background: "radial-gradient(circle, var(--mode-gradient-from) 0%, transparent 70%)",
                        willChange: "transform, opacity"
                    }}
                />
                <div 
                    className="absolute bottom-[-20%] right-[3%] w-[750px] h-[750px] rounded-full opacity-[0.28] dark:opacity-[0.2] animate-drift-bg-mesh transition-all duration-1000" 
                    style={{ 
                        background: "radial-gradient(circle, var(--mode-gradient-to) 0%, transparent 70%)",
                        animationDelay: "-8s",
                        willChange: "transform, opacity"
                    }}
                />
            </div>

            {/* Core Workspace Layout Panel */}
            <div className="relative z-10 flex w-full h-full overflow-hidden">
                
                {/* Narrow left sidebar (Always visible on Desktop) */}
                <div className={`hidden sm:flex flex-col items-center justify-between py-5 shrink-0 w-16 h-full border-r ${
                    isDarkMode ? "glass-panel-dark border-slate-900/60 bg-slate-950/40" : "glass-panel border-slate-200/50 bg-white/40"
                } z-30`}>
                    
                    {/* Top: Bot Logo */}
                    <Link to="/" className="flex items-center justify-center group shrink-0">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300 holographic-surface glowing-border">
                            <div className={`absolute inset-0 bg-gradient-to-tr opacity-25 group-hover:opacity-40 transition-opacity ${
                                activeMode ? varModeColor(activeMode) : "from-purple-600 to-pink-600"
                            }`} />
                            <img src="/bot-logo.png" alt="Logo" className="h-6 w-6 object-contain relative z-10" />
                        </div>
                    </Link>

                    {/* Middle Actions */}
                    <div className="flex flex-col items-center gap-4 w-full px-2">
                        {/* New Chat */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onNewChat}
                            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all shadow-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                            title="New Session"
                        >
                            <Plus className="h-5 w-5" />
                        </motion.button>

                        {/* Toggle Sessions History Drawer */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                                    isHistoryDrawerOpen 
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                                        : isDarkMode 
                                            ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700" 
                                            : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-350"
                                }`}
                                title="Chat History"
                            >
                                <MessageSquare className="h-5 w-5" />
                            </motion.button>
                        )}
                    </div>

                    {/* Bottom Profile Avatar & Popover settings */}
                    <div className="relative" ref={profileMenuRef}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all shadow-md ${
                                isDarkMode 
                                    ? "border-slate-800 bg-slate-900 hover:border-purple-500/80 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                                    : "border-slate-200 bg-slate-100 hover:border-purple-500 hover:shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                            }`}
                            title="Profile & Settings"
                        >
                            {renderProfileAvatar()}
                        </motion.button>

                        {/* Glassmorphic Profile Context Menu Popover */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                    className={`absolute bottom-12 left-1 z-50 w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl ${
                                        isDarkMode 
                                            ? "border-slate-800/90 bg-slate-950/95 text-slate-200 shadow-black/80" 
                                            : "border-slate-200/80 bg-white/95 text-slate-800"
                                    }`}
                                >
                                    {/* User metadata header */}
                                    <div className="flex items-center gap-3 border-b pb-3 mb-3 border-slate-800/30 dark:border-white/5">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                                            isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"
                                        }`}>
                                            {renderProfileAvatar()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black truncate">{user ? user.username : "Guest Operator"}</h4>
                                            <p className="text-[10px] text-slate-500 truncate">{user ? user.email : "Local Client"}</p>
                                        </div>
                                    </div>

                                    {/* Sub-menu options grid */}
                                    <div className="space-y-2.5">
                                        {/* Select Identity / Avatar Selector Accordion */}
                                        {user && (
                                            <div>
                                                <button
                                                    onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                                                        isDarkMode ? "hover:bg-slate-900/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-950"
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                                        Select Avatar
                                                    </span>
                                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAvatarSelect ? "rotate-90" : ""}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {showAvatarSelect && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900/20 dark:bg-black/20 rounded-xl mt-1.5">
                                                                {AVATARS.map((avatar) => {
                                                                    const isCurrent = user.avatar === avatar;
                                                                    return (
                                                                        <button
                                                                            key={avatar}
                                                                            onClick={() => handleSelectAvatar(avatar)}
                                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all ${
                                                                                isCurrent 
                                                                                    ? "border-purple-500 bg-purple-500/10 text-white" 
                                                                                    : isDarkMode ? "border-slate-800 bg-slate-950/50 hover:bg-slate-900" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                                                                            }`}
                                                                        >
                                                                            {avatar === "Bot" ? <Bot className="h-4 w-4 text-purple-400" /> :
                                                                             avatar === "User" ? <UserIcon className="h-4 w-4 text-purple-400" /> :
                                                                             avatar}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* AI Engine toggles */}
                                        <div className="space-y-1">
                                            <div className="px-2 text-[9px] tracking-widest font-black uppercase text-slate-500 mb-1">AI Engine</div>
                                            <div className={`grid grid-cols-2 p-1 rounded-xl border ${
                                                isDarkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-slate-100/50"
                                            }`}>
                                                <button
                                                    onClick={() => setProvider("online")}
                                                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                        provider === "online"
                                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/50 text-white shadow-sm"
                                                            : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
                                                    }`}
                                                >
                                                    <Cloud className="w-3 h-3" />
                                                    <span>Cloud</span>
                                                </button>
                                                <button
                                                    onClick={() => setProvider("offline")}
                                                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                        provider === "offline"
                                                            ? ollamaStatus.running 
                                                                ? "bg-emerald-600 border-emerald-500/50 text-white" 
                                                                : "bg-red-600 border-red-500/50 text-white"
                                                            : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
                                                    }`}
                                                >
                                                    <HardDrive className="w-3 h-3" />
                                                    <span>Local</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Settings & Utility shortcuts */}
                                        <div className="border-t border-slate-800/30 dark:border-white/5 pt-2.5 space-y-1">
                                            <Link
                                                to="/"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDarkMode ? "hover:bg-slate-900/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-950"
                                                }`}
                                            >
                                                <Home className="w-4 h-4 text-purple-400" />
                                                <span>Home Hub</span>
                                            </Link>


                                            {/* Purge Messages */}
                                            {user && onClearChat && (
                                                <button
                                                    onClick={() => {
                                                        onClearChat();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-colors text-red-500/80 hover:text-red-500 ${
                                                        isDarkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"
                                                    }`}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                    <span>Purge Sessions</span>
                                                </button>
                                            )}

                                            {/* Logout Option */}
                                            {user && (
                                                <button
                                                    onClick={() => {
                                                        onLogout();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                        isDarkMode ? "hover:bg-slate-900/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-950"
                                                    }`}
                                                >
                                                    <LogOut className="w-4 h-4 text-red-400" />
                                                    <span>Disconnect</span>
                                                </button>
                                            )}

                                            {/* Guest Login redirection */}
                                            {!user && (
                                                <Link
                                                    to="/login"
                                                    className="flex items-center justify-center w-full mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md"
                                                >
                                                    Sign in
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Secondary Sessions List Panel (Desktop, Slides out next to thin sidebar) */}
                <AnimatePresence>
                    {isHistoryDrawerOpen && user && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            className={`hidden sm:flex flex-col shrink-0 overflow-hidden border-r h-full ${
                                isDarkMode ? "glass-panel-dark border-slate-900/60 bg-slate-950/20" : "glass-panel border-slate-200/50 bg-white/20"
                            }`}
                        >
                            <div className="p-4 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] tracking-widest uppercase font-black text-slate-500">History Log</span>
                                    <button 
                                        onClick={() => setIsHistoryDrawerOpen(false)}
                                        className={`p-1.5 flex items-center justify-center rounded-lg border transition-all ${
                                            isDarkMode ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                        title="Close History Panel"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Interactive search sessions */}
                                <div className={`relative flex items-center rounded-xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/20 ${
                                    isDarkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
                                }`}>
                                    <Search className={`ml-3 h-3.5 w-3.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                                    <input
                                        type="text"
                                        placeholder="Search sessions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full bg-transparent p-2 text-xs font-semibold outline-none transition-all ${
                                            isDarkMode ? "text-slate-200 placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"
                                        }`}
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            className={`mr-2.5 p-1 rounded-full transition-colors ${isDarkMode ? "text-slate-500 hover:text-slate-350" : "text-slate-400 hover:text-slate-700"}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable chat sessions list */}
                            <div data-lenis-prevent className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-none">
                                <AnimatePresence initial={false}>
                                    {filteredChatList?.map((chat) => {
                                        const isActive = currentChatId === chat._id;
                                        return (
                                            <motion.div
                                                key={chat._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                className={`group relative flex items-center justify-between rounded-xl p-3 text-xs font-bold transition-all ${
                                                    isActive 
                                                        ? isDarkMode 
                                                            ? "bg-slate-900/90 text-white shadow-md border-l-2 border-purple-500 shadow-[0_4px_12px_rgba(0,0,0,0.15)]" 
                                                            : "bg-white text-slate-900 shadow-md border-l-2 border-purple-500"
                                                        : isDarkMode 
                                                            ? "text-slate-400 hover:bg-slate-900/50 hover:text-white" 
                                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                }`}
                                            >
                                                {editingChatId === chat._id ? (
                                                    <div className="flex w-full items-center gap-1.5 z-10">
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                            autoFocus
                                                            className={`w-full flex-1 rounded px-2 py-1 text-xs outline-none border ${isDarkMode ? "bg-slate-950 text-white border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}
                                                        />
                                                        <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-400"><Check className="h-4 w-4" /></button>
                                                        <button onClick={cancelEdit} className="text-red-500 hover:text-red-400"><XCircle className="h-4 w-4" /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => onSelectChat(chat._id)}
                                                            className="flex flex-1 items-center gap-3 overflow-hidden text-left"
                                                        >
                                                            <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-purple-400" : "text-slate-500 group-hover:text-purple-400"}`} />
                                                            <span className="truncate">{chat.title || "Untitled Chat"}</span>
                                                        </button>
                                                        
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => startEditing(chat)} 
                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-blue-500 hover:bg-slate-200"}`}
                                                                title="Rename Session"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </button>
                                                            <button 
                                                                onClick={() => onDeleteChatSession(chat._id)} 
                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-slate-200"}`}
                                                                title="Delete Session"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {chatList?.length === 0 && (
                                    <div className={`p-8 text-center text-xs font-semibold ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
                                        No active sessions
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Drawer (Fully Animated overlay for small viewports) */}
                <AnimatePresence>
                    {isHistoryDrawerOpen && user && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHistoryDrawerOpen(false)}
                            className="sm:hidden absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                onClick={(e) => e.stopPropagation()}
                                className={`w-72 h-full flex flex-col p-4 border-r ${isDarkMode ? "bg-slate-950 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-sm tracking-widest uppercase text-slate-500">Navigation</h3>
                                    <button onClick={() => setIsHistoryDrawerOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-slate-900 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        onNewChat();
                                        setIsHistoryDrawerOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md mb-4"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>New Session</span>
                                </motion.button>

                                <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
                                    {chatList?.map(chat => {
                                        const isActive = currentChatId === chat._id;
                                        return (
                                            <button
                                                key={chat._id}
                                                onClick={() => {
                                                    onSelectChat(chat._id);
                                                    setIsHistoryDrawerOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 rounded-lg p-3 text-xs font-bold text-left transition-colors ${
                                                    isActive 
                                                        ? isDarkMode ? "bg-slate-900 text-purple-400" : "bg-slate-100 text-purple-600"
                                                        : isDarkMode ? "text-slate-400 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{chat.title || "Untitled Chat"}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Viewport Core Children container */}
                <div className="flex min-w-0 flex-1 flex-col relative h-full">
                    {/* Expose sidebar state triggers via standard context if necessary or direct rendering */}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                                isHistoryDrawerOpen,
                                onToggleHistoryDrawer: () => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)
                            });
                        }
                        return child;
                    })}
                </div>

            </div>
        </div>
    );
};

// Helper mode color resolver for styling sidebars
const varModeColor = (mode) => {
    const modeConfigs = {
        chat: "from-blue-600 to-cyan-500",
        code: "from-purple-600 to-pink-600",
        study: "from-emerald-600 to-cyan-500",
        creative: "from-orange-500 to-rose-500"
    };
    return modeConfigs[mode] || "from-purple-600 to-pink-600";
};

export default Layout;
