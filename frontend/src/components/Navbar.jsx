import React, { useState } from "react";
import { Bot, Sun, Moon, LogOut, Trash2, Cpu, Home, Info, HardDrive, Cloud, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { MODES } from "../constants";
import { useChatSettings } from "../context/ChatSettingsContext";

const AVATARS = ["Bot", "User", "🤖", "😎", "🐱", "🚀", "🧑‍💻", "🦄", "🐼"];

const Navbar = ({
    user,
    isDarkMode,
    toggleDarkMode,
    activeMode,
    onLogout,
    onClearChat,
    onChangeAvatar
}) => {
    const location = useLocation();
    const { provider, setProvider, ollamaStatus } = useChatSettings();
    const CurrentIcon = activeMode ? (MODES[activeMode]?.icon || Bot) : Bot;
    const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

    const navLinkClass = (path) => {
        const active = location.pathname === path;
        return `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${active
            ? isDarkMode ? "bg-slate-800/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-slate-700/50" : "bg-white text-slate-950 shadow-sm border border-slate-200"
            : isDarkMode ? "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent"
            }`;
    };

    const handleSelectAvatar = (a) => {
        if (onChangeAvatar) onChangeAvatar(a);
        setShowAvatarDropdown(false);
    };

    const renderUserAvatar = () => {
        if (!user) return null;
        const avatarStr = user.avatar || "User";
        
        return (
            <div className="relative">
                <button
                    onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isDarkMode ? "border-slate-700 bg-slate-800 hover:border-purple-500" : "border-slate-200 bg-slate-100 hover:border-purple-500"}`}
                    title="Change Avatar"
                >
                    {avatarStr === "Bot" ? <Bot className="h-5 w-5 text-purple-500" /> : 
                     avatarStr === "User" ? <UserIcon className="h-5 w-5 text-purple-500" /> :
                     <span className="text-xl leading-none">{avatarStr}</span>}
                </button>

                {showAvatarDropdown && (
                    <div className={`absolute right-0 top-12 z-50 w-48 rounded-2xl border p-3 shadow-xl ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
                        <div className="mb-2 px-2 text-xs font-semibold text-slate-400">Select Avatar</div>
                        <div className="grid grid-cols-3 gap-2">
                            {AVATARS.map((a) => (
                                <button
                                    key={a}
                                    onClick={() => handleSelectAvatar(a)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${user.avatar === a ? (isDarkMode ? "bg-slate-700 ring-2 ring-purple-500" : "bg-slate-100 ring-2 ring-purple-500") : ""}`}
                                >
                                    {a === "Bot" ? <Bot className="h-5 w-5" /> : 
                                     a === "User" ? <UserIcon className="h-5 w-5" /> :
                                     <span className="text-lg leading-none">{a}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className={`relative z-30 transition-colors duration-300 border-b ${isDarkMode ? "glass-navbar-dark border-slate-800" : "glass-navbar border-slate-200"}`}>
            <div className="mx-auto flex min-h-[5.5rem] w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
                <Link to="/" className="flex min-w-0 items-center gap-3 group">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${activeMode ? (MODES[activeMode]?.color || "from-purple-600 to-pink-600") : "from-slate-800 to-slate-600"} text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden p-1`}>
                        <img src="/bot-logo.png" alt="Bot Logo" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <h1 className={`truncate text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"} group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                            Chatterbot
                        </h1>
                        <p className={`truncate text-[10px] tracking-widest uppercase font-bold ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                            {activeMode ? MODES[activeMode]?.label : "AI Assistant"}
                        </p>
                    </div>
                </Link>

                <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
                    <div className={`hidden items-center gap-1 sm:flex mr-2 p-1 rounded-2xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100 border-slate-200/50"}`}>
                        <Link to="/" className={navLinkClass("/")}>
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <Link to="/about" className={navLinkClass("/about")}>
                            <Info className="h-4 w-4" />
                            About
                        </Link>
                        <Link to="/chat" className={navLinkClass("/chat")}>
                            <Bot className="h-4 w-4" />
                            Chat
                        </Link>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <div className={`flex items-center gap-1 p-1 rounded-full border ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                            <button
                                type="button"
                                onClick={() => setProvider("online")}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${provider === "online"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                                    : isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <Cloud className="h-3.5 w-3.5" />
                                Online Mode
                            </button>
                            <button
                                type="button"
                                onClick={() => setProvider("offline")}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${provider === "offline"
                                    ? ollamaStatus.running ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <HardDrive className="h-3.5 w-3.5" />
                                Offline Mode
                            </button>
                        </div>

                        {user && (
                            <div className={`hidden md:inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-slate-900 text-slate-300 border border-slate-800" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                                <div className={`h-2 w-2 rounded-full animate-pulse ${provider === "offline" ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                                {provider === "offline" ? "AI Offline" : "AI Online"}
                            </div>
                        )}

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        {renderUserAvatar()}
                        
                        {(user || location.pathname === "/chat") && onClearChat && (
                            <button
                                type="button"
                                onClick={onClearChat}
                                className={`rounded-xl p-2.5 transition-colors ${isDarkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                                title="Clear chat messages"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`rounded-lg p-2.5 transition-colors ${isDarkMode ? "text-yellow-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}
                        title={isDarkMode ? "Use light theme" : "Use dark theme"}
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {user ? (
                        <button
                            type="button"
                            onClick={onLogout}
                            className={`rounded-lg p-2.5 transition-colors ${isDarkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                            title={`Logout ${user.username}`}
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/chat"
                                className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 sm:inline-flex ${isDarkMode ? "text-slate-200 hover:bg-slate-800 hover:shadow-md" : "text-slate-700 hover:bg-slate-100 hover:shadow-sm"}`}
                            >
                                Try chat
                            </Link>
                            <Link
                                to="/login"
                                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${isDarkMode ? "text-slate-200 hover:bg-slate-800 hover:shadow-md" : "text-slate-700 hover:bg-slate-100 hover:shadow-sm"}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/60"
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
