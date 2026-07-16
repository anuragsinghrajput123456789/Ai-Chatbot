import React, { useState, useEffect, useRef } from "react";
import { Bot, Sun, Moon, LogOut, Trash2, Home, HardDrive, Cloud, User as UserIcon, Sparkles, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { MODES } from "../constants";
import { useChatSettings } from "../context/ChatSettingsContext";
import { motion } from "framer-motion";

const AVATARS = ["Bot", "User", "🤖", "😎", "🐱", "🚀", "🧑‍💻", "🦄", "🐼"];

const Navbar = ({
    user,
    isDarkMode,
    toggleDarkMode: _toggleDarkMode,
    activeMode,
    onLogout,
    onClearChat,
    onChangeAvatar,
    onToggleSidebar,
    isSidebarOpen
}) => {
    const location = useLocation();
    const isChatPage = location.pathname === "/chat";
    const { provider, setProvider, ollamaStatus } = useChatSettings();
    const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const avatarRef = useRef(null);

    // Close avatar dropdown on outside click
    useEffect(() => {
        if (!showAvatarDropdown) return;
        const handler = (e) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target)) {
                setShowAvatarDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showAvatarDropdown]);

    // Track scroll height to enable sticky glass blur transformation
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Active path checker
    const isActivePath = (path) => location.pathname === path;

    const handleSelectAvatar = (a) => {
        if (onChangeAvatar) onChangeAvatar(a);
        setShowAvatarDropdown(false);
    };

    const renderUserAvatar = () => {
        if (!user) return null;
        const avatarStr = user.avatar || "User";
        
        return (
            <div className="relative" ref={avatarRef}>
                {/* luxury Pulsing Avatar Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all shadow-md ${
                        isDarkMode 
                            ? "border-slate-800 bg-slate-900 hover:border-purple-500/80 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
                            : "border-slate-200 bg-slate-100 hover:border-purple-500 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    }`}
                    title="Avatar Settings"
                >
                    {avatarStr === "Bot" ? <Bot className="h-5 w-5 text-purple-500" /> : 
                     avatarStr === "User" ? <UserIcon className="h-5 w-5 text-purple-500" /> :
                     <span className="text-xl leading-none">{avatarStr}</span>}
                </motion.button>

                {/* Command Palette Avatar Dropdown (Glassmorphic Layer) */}
                {showAvatarDropdown && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`absolute right-0 top-14 z-50 w-52 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl ${
                            isDarkMode 
                                ? "border-slate-800 bg-slate-950/95 text-slate-200 shadow-black/60" 
                                : "border-slate-200/80 bg-white/95 text-slate-800"
                        }`}
                    >
                        <div className="mb-3 px-1 text-[10px] tracking-widest uppercase font-black text-purple-500 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Select Identity</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {AVATARS.map((a) => {
                                const isCurrent = user.avatar === a;
                                return (
                                    <motion.button
                                        key={a}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => handleSelectAvatar(a)}
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                                            isDarkMode 
                                                ? "hover:bg-slate-900 hover:border-purple-500/50" 
                                                : "hover:bg-slate-100 hover:border-purple-500/50"
                                        } ${isCurrent ? (isDarkMode ? "bg-slate-900 border-purple-500 ring-1 ring-purple-500/30" : "bg-slate-100 border-purple-500 ring-1 ring-purple-500/30") : (isDarkMode ? "border-slate-800/80 bg-slate-950/20" : "border-slate-200/50 bg-slate-50")}`}
                                    >
                                        {a === "Bot" ? <Bot className="h-5 w-5 text-purple-400" /> : 
                                         a === "User" ? <UserIcon className="h-5 w-5 text-purple-400" /> :
                                         <span className="text-xl leading-none">{a}</span>}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <nav 
            className={`sticky top-0 z-40 w-full transition-all duration-500 border-b ${
                (scrolled || isChatPage) 
                    ? isDarkMode 
                        ? "glass-navbar-dark border-slate-900/80 shadow-2xl backdrop-blur-[24px] py-1.5" 
                        : "glass-navbar border-slate-200/90 shadow-md backdrop-blur-[24px] py-1.5" 
                    : isDarkMode 
                        ? "bg-transparent border-transparent py-3" 
                        : "bg-transparent border-transparent py-3"
            }`}
        >
            <div className="mx-auto flex min-h-[5rem] w-full max-w-7xl items-center justify-between gap-4 px-6">
                
                {/* Unified Sidebar Toggle Button (authenticated users on all screens) */}
                {user && onToggleSidebar && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleSidebar}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
                            isDarkMode 
                                ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700" 
                                : "border-slate-200 bg-white/60 text-slate-500 hover:text-slate-900 hover:border-slate-350"
                        }`}
                        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </motion.button>
                )}

                {/* Branding Core Logo Element */}
                <Link to="/" className="flex items-center gap-3.5 group shrink-0">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300 holographic-surface glowing-border glowing-border-active">
                        {/* pulsing background aura */}
                        <div className={`absolute inset-0 bg-gradient-to-tr opacity-25 group-hover:opacity-40 transition-opacity ${
                            activeMode ? MODES[activeMode]?.color : "from-purple-600 to-pink-600"
                        }`} />
                        {/* Rotating external logo ring overlay */}
                        <div className="absolute inset-1 rounded-xl border border-dashed border-purple-500/30 animate-spin-slow pointer-events-none" />
                        <img src="/bot-logo.png" alt="Bot Logo" className="h-7 w-7 object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                    </div>
                    <div className="min-w-0">
                        <h1 className={`truncate text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"} group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                            Chatterbot
                        </h1>
                        <p className={`truncate text-[9px] tracking-widest uppercase font-black ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                            {activeMode ? MODES[activeMode]?.label : "AI Operating System"}
                        </p>
                    </div>
                </Link>

                {/* Right Deck Nav */}
                <div className="flex items-center justify-end gap-3 flex-1 flex-nowrap min-w-0">
                    
                    {/* Navigation Links using layoutId for fluid sliding capsule indicators */}
                    <div className={`hidden items-center gap-1.5 xl:flex p-1.5 rounded-2xl border ${
                        isDarkMode ? "bg-slate-950/60 border-slate-900" : "bg-slate-100 border-slate-200/50"
                    }`}>
                        {[
                            { path: "/", label: "Home", icon: Home },
                            { path: "/chat", label: "Chat Core", icon: Bot }
                        ].map((link) => {
                            const isLinkActive = isActivePath(link.path);
                            return (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                                        isLinkActive 
                                            ? "text-white" 
                                            : isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-950"
                                    }`}
                                >
                                    {isLinkActive && (
                                        <motion.span 
                                            layoutId="nav-glow-indicator"
                                            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.45),0_0_8px_rgba(236,72,153,0.3)] -z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <link.icon className="h-3.5 w-3.5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mode selector panel (Online vs Local Offline AI) */}
                    <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full border border-slate-800/80 bg-slate-950/60 shrink-0">
                        <button
                            type="button"
                            onClick={() => setProvider("online")}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all border ${
                                provider === "online"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.45)] scale-[1.02]"
                                    : isDarkMode ? "border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-600"
                             }`}
                        >
                            <Cloud className="h-3.5 w-3.5" />
                            <span>Gemini <span className="hidden xl:inline">(Cloud)</span></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setProvider("offline")}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all border ${
                                provider === "offline"
                                    ? ollamaStatus.running 
                                        ? "bg-emerald-600 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] scale-[1.02] animate-pulse" 
                                        : "bg-red-600 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.45)] scale-[1.02]"
                                    : isDarkMode ? "border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <HardDrive className="h-3.5 w-3.5" />
                            <span>Ollama <span className="hidden xl:inline">(Local)</span></span>
                        </button>
                    </div>

                    {/* Clear Chat Trash Button (Only displayed in Chat and if session active) */}
                    {user && onClearChat && (
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={onClearChat}
                            className={`rounded-xl p-2.5 transition-colors border ${
                                isDarkMode 
                                    ? "text-red-400 border-slate-900 bg-slate-950/40 hover:bg-red-500/10 hover:border-red-500/25" 
                                    : "text-red-500 border-slate-200 bg-white/40 hover:bg-red-50 hover:border-red-500/25"
                            }`}
                            title="Purge Messages"
                        >
                            <Trash2 className="h-4 w-4" />
                        </motion.button>
                    )}


                    {/* Authentication Status controls */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            {!isChatPage && (
                                <Link
                                    to="/chat"
                                    className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_22px_rgba(168,85,247,0.55),0_0_8px_rgba(236,72,153,0.35)] shrink-0"
                                >
                                    <Bot className="h-3.5 w-3.5 text-white" />
                                    <span>Chat Core</span>
                                </Link>
                            )}
                            <div className="hidden sm:block h-6 w-px bg-slate-800/80 mx-1"></div>
                            {renderUserAvatar()}
                            
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={onLogout}
                                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border transition-all ${
                                    isDarkMode 
                                        ? "border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-white" 
                                        : "border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-950"
                                }`}
                                title={`Disconnect ${user.username}`}
                            >
                                <LogOut className="h-3.5 w-3.5 text-red-500" />
                                <span className="hidden sm:inline">Logout</span>
                            </motion.button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className={`hidden sm:inline-flex rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                                    isDarkMode ? "text-slate-200 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_22px_rgba(168,85,247,0.55),0_0_8px_rgba(236,72,153,0.35)]"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
