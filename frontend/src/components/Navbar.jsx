import React from "react";
import { Bot, Sun, Moon, LogOut, Trash2, Cpu, Home, Info, Mail, HardDrive, Cloud } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { MODES } from "../constants";
import { useChatSettings } from "../context/ChatSettingsContext";

const Navbar = ({
    user,
    isDarkMode,
    toggleDarkMode,
    activeMode,
    onLogout,
    onClearChat
}) => {
    const location = useLocation();
    const { provider, setProvider, ollamaStatus } = useChatSettings();
    const CurrentIcon = activeMode ? (MODES[activeMode]?.icon || Bot) : Bot;

    const navLinkClass = (path) => {
        const active = location.pathname === path;
        return `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${active
            ? isDarkMode ? "bg-slate-800/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-slate-700/50" : "bg-white text-slate-950 shadow-sm border border-slate-200"
            : isDarkMode ? "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent"
            }`;
    };

    return (
        <nav className={`relative z-30 transition-colors duration-300 ${isDarkMode ? "glass-navbar-dark" : "glass-navbar"}`}>
            <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
                <Link to="/" className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${activeMode ? (MODES[activeMode]?.color || "from-purple-600 to-pink-600") : "from-slate-800 to-slate-600"} text-white shadow-lg`}>
                        <CurrentIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <h1 className={`truncate text-xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"} hover:text-gradient transition-all`}>
                            Chatterchatbot
                        </h1>
                        {activeMode && (
                            <p className={`truncate text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                {MODES[activeMode]?.label || "Chat"}
                            </p>
                        )}
                    </div>
                </Link>

                <div className="flex flex-1 items-center justify-end gap-2">
                    {!user && (
                        <div className="hidden items-center gap-1 sm:flex">
                            <Link to="/" className={navLinkClass("/")}>
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                            <Link to="/about" className={navLinkClass("/about")}>
                                <Info className="h-4 w-4" />
                                About
                            </Link>
                            <Link to="/contact" className={navLinkClass("/contact")}>
                                <Mail className="h-4 w-4" />
                                Contact
                            </Link>
                            <Link to="/chat" className={navLinkClass("/chat")}>
                                <Bot className="h-4 w-4" />
                                Chat
                            </Link>
                        </div>
                    )}

                    <div className="hidden items-center gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => setProvider(provider === "offline" ? "online" : "offline")}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${provider === "offline"
                                ? ollamaStatus.running ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
                                : isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                                }`}
                            title="Switch Online Gemini / Offline Ollama"
                        >
                            {provider === "offline" ? <HardDrive className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
                            {provider === "offline" ? "Offline Ollama" : "Online Gemini"}
                        </button>

                        {user && (
                            <>
                                <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${isDarkMode ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                    <Cpu className="h-3.5 w-3.5 text-emerald-500" />
                                    AI Online
                                </div>
                            </>
                        )}

                        {(user || location.pathname === "/chat") && (
                            <button
                                type="button"
                                onClick={onClearChat}
                                className={`rounded-lg p-2.5 transition-colors ${isDarkMode ? "text-red-300 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}
                                title="Clear chat"
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
