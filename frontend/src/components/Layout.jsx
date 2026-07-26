import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
    MessageSquarePlus, MessageSquare, Trash2, Edit2, Menu, X, Check, XCircle, Search, RefreshCw,
    Bot, LogOut, Home, HardDrive, Cloud, User as UserIcon, Sparkles, Plus, Settings, ChevronRight,
    Star, Archive, Copy, Folder, ChevronDown, PlusCircle, Pin, FileText, DownloadCloud, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatSettings } from "../context/ChatSettingsContext";
import { 
    searchConversations, fetchWorkspaces, createWorkspace, deleteWorkspace,
    moveChatToWorkspace, duplicateChat, toggleFavoriteChat, toggleArchiveChat,
    exportUserChats, importUserChats, fetchAllDocuments, deleteDocument
} from "../api";

const AVATARS = ["Bot", "User", "🤖", "😎", "🐱", "🚀", "🧑‍💻", "🦄", "🐼"];

const Layout = ({ 
    children, 
    isDarkMode, 
    toggleDarkMode: _toggleDarkMode, 
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
    onRenameChatSession,
    activeWorkspaceId,
    setActiveWorkspaceId,
    onRefreshChatList
}) => {
    const { provider, setProvider, ollamaStatus, onlineModel, setOnlineModel, ollamaModel, setOllamaModel, ollamaModels, refreshOllama } = useChatSettings();
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const profileMenuRef = useRef(null);

    const [searchResults, setSearchResults] = useState([]);
    const [searchPagination, setSearchPagination] = useState({ total: 0, page: 1, limit: 5, pages: 0 });
    const [searchPage, setSearchPage] = useState(1);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState("anytime"); // anytime, today, week, month
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("recentSearches") || "[]");
        } catch {
            return [];
        }
    });
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Workspaces state and hooks
    const [workspaces, setWorkspaces] = useState([]);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
    const [newWorkspaceColor, setNewWorkspaceColor] = useState("#a855f7");
    const [newWorkspaceIcon, setNewWorkspaceIcon] = useState("Folder");
    
    const [listFilter, setListFilter] = useState("active"); // active, favorites, archived
    const [movingChatId, setMovingChatId] = useState(null);

    // Model Manager states
    const [showModelManager, setShowModelManager] = useState(false);

    // Pinned chats list state
    const [pinnedChats, setPinnedChats] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("pinnedChats") || "[]");
        } catch {
            return [];
        }
    });

    const handleTogglePin = (chatId, e) => {
        e.stopPropagation();
        setPinnedChats(prev => {
            const next = prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId];
            localStorage.setItem("pinnedChats", JSON.stringify(next));
            return next;
        });
    };

    // Workspace Modular Dashboard States
    const [showWorkspacesModal, setShowWorkspacesModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [showDownloadsModal, setShowDownloadsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const [allDocs, setAllDocs] = useState([]);
    const [allDocsLoading, setAllDocsLoading] = useState(false);

    const [pullModelName, setPullModelName] = useState("");
    const [pullProgress, setPullProgress] = useState("");
    const [isPulling, setIsPulling] = useState(false);

    const loadAllDocs = async () => {
        if (!user) return;
        setAllDocsLoading(true);
        try {
            const data = await fetchAllDocuments();
            setAllDocs(data.documents || []);
        } catch (err) {
            console.error("Failed to load documents globally", err);
        } finally {
            setAllDocsLoading(false);
        }
    };

    useEffect(() => {
        if (showDocumentsModal) {
            loadAllDocs();
        }
    }, [showDocumentsModal]);

    const handleExport = async () => {
        try {
            const data = await exportUserChats();
            const jsonStr = JSON.stringify(data.chats, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chatterbot-workspace-backup-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed to export chats: " + err.message);
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const chats = JSON.parse(event.target.result);
                if (!Array.isArray(chats)) throw new Error("Invalid format: Must be an array of chat items.");
                
                const confirmImport = window.confirm(`Importing ${chats.length} chat sessions. Proceed?`);
                if (!confirmImport) return;

                await importUserChats(chats);
                alert("Chats imported successfully!");
                if (onRefreshChatList) onRefreshChatList();
            } catch (err) {
                alert("Failed to import chats: " + err.message);
            } finally {
                e.target.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handlePullModel = async () => {
        if (!pullModelName.trim()) return;
        setIsPulling(true);
        setPullProgress("Connecting to local node...");
        try {
            const res = await fetch("http://localhost:11434/api/pull", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: pullModelName.trim(), stream: false })
            });
            
            if (!res.ok) throw new Error("Local node returned error status: " + res.status);
            
            setPullProgress("Model pulled successfully!");
            setPullModelName("");
            if (refreshOllama) refreshOllama();
        } catch (err) {
            setPullProgress("Pull failed: Make sure Ollama is running locally and CORS is configured.");
        } finally {
            setIsPulling(false);
        }
    };
    const [modelTab, setModelTab] = useState("online"); // online or offline
    const [customOpenRouterModel, setCustomOpenRouterModel] = useState(() => {
        const saved = localStorage.getItem("onlineModel") || "";
        return (saved && !saved.startsWith("gemini-")) ? saved : "";
    });

    const loadWorkspaces = useCallback(async () => {
        if (!user) return;
        try {
            const data = await fetchWorkspaces();
            setWorkspaces(data.workspaces || []);
            setUnassignedCount(data.unassignedCount || 0);
        } catch (err) {
            console.error("Failed to load workspaces", err);
        }
    }, [user]);

    useEffect(() => {
        loadWorkspaces();
    }, [loadWorkspaces, chatList]);

    const handleCreateWorkspaceSubmit = async (e) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        try {
            await createWorkspace({
                name: newWorkspaceName.trim(),
                description: newWorkspaceDesc.trim(),
                color: newWorkspaceColor,
                icon: newWorkspaceIcon
            });
            setNewWorkspaceName("");
            setNewWorkspaceDesc("");
            setShowCreateWorkspace(false);
            await loadWorkspaces();
        } catch (err) {
            alert("Failed to create workspace: " + err.message);
        }
    };

    const handleDeleteWorkspaceClick = async (workspaceId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this workspace? The conversations inside will be preserved under 'Inbox'.")) return;
        try {
            await deleteWorkspace(workspaceId);
            setActiveWorkspaceId("all");
            await loadWorkspaces();
            if (onRefreshChatList) onRefreshChatList();
        } catch (err) {
            alert("Failed to delete workspace: " + err.message);
        }
    };

    const handleDuplicateChatClick = async (chatId, e) => {
        e.stopPropagation();
        try {
            await duplicateChat(chatId);
            if (onRefreshChatList) onRefreshChatList();
        } catch (err) {
            alert("Failed to duplicate chat: " + err.message);
        }
    };

    const handleToggleFavoriteClick = async (chatId, e) => {
        e.stopPropagation();
        try {
            await toggleFavoriteChat(chatId);
            if (onRefreshChatList) onRefreshChatList();
        } catch (err) {
            alert("Failed to toggle favorite: " + err.message);
        }
    };

    const handleToggleArchiveClick = async (chatId, e) => {
        e.stopPropagation();
        try {
            await toggleArchiveChat(chatId);
            if (onRefreshChatList) onRefreshChatList();
        } catch (err) {
            alert("Failed to toggle archive: " + err.message);
        }
    };

    const handleMoveChat = async (chatId, targetWorkspaceId) => {
        try {
            await moveChatToWorkspace(chatId, targetWorkspaceId || null);
            setMovingChatId(null);
            if (onRefreshChatList) onRefreshChatList();
        } catch (err) {
            alert("Failed to move chat: " + err.message);
        }
    };

    const getWorkspaceColor = (wsId) => {
        if (wsId === "all") return "#a855f7";
        if (wsId === "unassigned") return "#64748b";
        const ws = workspaces.find(w => w._id === wsId);
        return ws ? ws.color : "#a855f7";
    };

    const getWorkspaceName = (wsId) => {
        if (wsId === "all") return "All Chats";
        if (wsId === "unassigned") return "Unassigned Inbox";
        const ws = workspaces.find(w => w._id === wsId);
        return ws ? ws.name : "Unknown Workspace";
    };

    const getWorkspaceChatCount = (wsId) => {
        if (wsId === "all") return chatList?.filter(c => !c.isArchived).length || 0;
        if (wsId === "unassigned") return unassignedCount;
        const ws = workspaces.find(w => w._id === wsId);
        return ws ? ws.chatCount : 0;
    };

    const getStartDate = useCallback(() => {
        if (dateFilter === "today") {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            return date.toISOString();
        }
        if (dateFilter === "week") {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            return date.toISOString();
        }
        if (dateFilter === "month") {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            return date.toISOString();
        }
        return null;
    }, [dateFilter]);

    const performSearch = useCallback(async (query, pageNum) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearchLoading(true);
        try {
            const wsParam = activeWorkspaceId === "all" ? null : activeWorkspaceId;
            const data = await searchConversations(query, pageNum, 5, getStartDate(), null, wsParam);
            setSearchResults(data.results || []);
            setSearchPagination(data.pagination || { total: 0, page: 1, limit: 5, pages: 0 });
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearchLoading(false);
        }
    }, [getStartDate, activeWorkspaceId]);

    const saveRecentSearch = useCallback((query) => {
        if (!query.trim()) return;
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== query.trim().toLowerCase());
            const next = [query.trim(), ...filtered].slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(next));
            return next;
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery, searchPage);
            } else {
                setSearchResults([]);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, searchPage, dateFilter, performSearch]);

    const handleSearchSubmit = (e) => {
        if (e.key === "Enter") {
            performSearch(searchQuery, 1);
            saveRecentSearch(searchQuery);
        }
    };

    const highlightText = (text, query) => {
        if (!query?.trim() || !text) return text;
        const terms = query.split(/\s+/).filter(Boolean);
        const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) 
                ? <mark key={i} className="bg-purple-500/30 text-purple-300 font-extrabold px-0.5 rounded">{part}</mark> 
                : part
        );
    };

    const finalChatList = chatList?.filter(chat => {
        if (activeWorkspaceId === "unassigned") {
            if (chat.workspaceId) return false;
        } else if (activeWorkspaceId !== "all") {
            if (chat.workspaceId !== activeWorkspaceId) return false;
        }

        if (listFilter === "archived") {
            return chat.isArchived === true;
        } else if (listFilter === "favorites") {
            return chat.isFavorite === true && chat.isArchived === false;
        } else {
            return chat.isArchived === false;
        }
    });

    const filteredChatList = finalChatList?.filter(chat => 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedFilteredList = filteredChatList?.filter(chat => pinnedChats.includes(chat._id)) || [];
    const regularFilteredList = filteredChatList?.filter(chat => !pinnedChats.includes(chat._id)) || [];

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

                    {/* Middle Actions (Professional AI Workspace Module Navigation Dock) */}
                    <div className="flex flex-col items-center gap-3.5 w-full px-2">
                        {/* Chat / New Session */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onNewChat}
                            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all shadow-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                            title="New Session"
                        >
                            <Plus className="h-4.5 w-4.5" />
                        </motion.button>

                        {/* Chat History Panel Switcher */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    isHistoryDrawerOpen 
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm" 
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Chat Logs Drawer"
                            >
                                <MessageSquare className="h-4.5 w-4.5" />
                            </motion.button>
                        )}

                        {/* Workspaces Module */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowWorkspacesModal(true)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showWorkspacesModal
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Workspaces Module"
                            >
                                <Folder className="h-4.5 w-4.5" />
                            </motion.button>
                        )}

                        {/* Documents Module */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDocumentsModal(true)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showDocumentsModal
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Documents Library Module"
                            >
                                <FileText className="h-4.5 w-4.5" />
                            </motion.button>
                        )}

                        {/* Models Settings Module */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowModelManager(true);
                                    if (provider === "offline") refreshOllama();
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showModelManager
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Models Selector Module"
                            >
                                <Bot className="h-4.5 w-4.5" />
                            </motion.button>
                        )}

                        {/* Downloads Module */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDownloadsModal(true)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showDownloadsModal
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Downloads & Backup Module"
                            >
                                <DownloadCloud className="h-4.5 w-4.5" />
                            </motion.button>
                        )}

                        {/* Settings Module */}
                        {user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSettingsModal(true)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showSettingsModal
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : isDarkMode ? "border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                                }`}
                                title="Workspace Settings"
                            >
                                <Settings className="h-4.5 w-4.5" />
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

                                            <Link
                                                to="/offline"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDarkMode ? "hover:bg-slate-900/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-650 hover:text-slate-950"
                                                }`}
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <HardDrive className="w-4 h-4 text-purple-400" />
                                                <span>Local Node Manager</span>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setShowModelManager(true);
                                                    setShowProfileMenu(false);
                                                    if (provider === "offline") {
                                                        refreshOllama();
                                                    }
                                                }}
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                                                    isDarkMode ? "hover:bg-slate-900/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-650 hover:text-slate-950"
                                                }`}
                                            >
                                                <Settings className="w-4 h-4 text-purple-400" />
                                                <span>Model Settings</span>
                                            </button>


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
                            <div className="p-4 flex flex-col gap-3.5">
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

                                {/* Workspace Selector Card */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowWorkspaceSelector(!showWorkspaceSelector)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                            isDarkMode 
                                                ? "border-slate-850 bg-slate-950/80 hover:bg-slate-900/60" 
                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getWorkspaceColor(activeWorkspaceId) }} />
                                            <span className="text-xs font-bold truncate">
                                                {getWorkspaceName(activeWorkspaceId)}
                                            </span>
                                            <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded-md">
                                                {getWorkspaceChatCount(activeWorkspaceId)}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showWorkspaceSelector ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Workspace Selector Dropdown List */}
                                    <AnimatePresence>
                                        {showWorkspaceSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className={`absolute left-0 right-0 mt-1.5 z-50 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl max-h-64 overflow-y-auto scrollbar-none ${
                                                    isDarkMode 
                                                        ? "border-slate-800 bg-slate-950 text-slate-200 shadow-black/80" 
                                                        : "border-slate-200 bg-white text-slate-850 shadow-slate-100"
                                                }`}
                                            >
                                                {/* All Chats */}
                                                <button
                                                    onClick={() => {
                                                        setActiveWorkspaceId("all");
                                                        setShowWorkspaceSelector(false);
                                                    }}
                                                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-900/40 hover:text-white transition-colors text-left"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                        All Chats
                                                    </span>
                                                    <span className="text-[9px] font-bold opacity-60">
                                                        {chatList?.filter(c => !c.isArchived).length || 0}
                                                    </span>
                                                </button>

                                                {/* Unassigned Inbox */}
                                                <button
                                                    onClick={() => {
                                                        setActiveWorkspaceId("unassigned");
                                                        setShowWorkspaceSelector(false);
                                                    }}
                                                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-900/40 hover:text-white transition-colors text-left"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                                                        Inbox (Unassigned)
                                                    </span>
                                                    <span className="text-[9px] font-bold opacity-60">{unassignedCount}</span>
                                                </button>

                                                <div className="border-t border-slate-900/50 dark:border-white/5 my-1.5" />

                                                {/* Custom Workspaces */}
                                                {workspaces.map((ws) => (
                                                    <div 
                                                        key={ws._id}
                                                        className="group/item flex items-center justify-between hover:bg-slate-900/40 rounded-xl px-1"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setActiveWorkspaceId(ws._id);
                                                                setShowWorkspaceSelector(false);
                                                            }}
                                                            className="flex-1 flex items-center gap-2 p-2 text-xs font-bold text-left hover:text-white min-w-0 transition-colors"
                                                        >
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ws.color }} />
                                                            <span className="truncate">{ws.name}</span>
                                                            <span className="text-[9px] font-black opacity-60 shrink-0">({ws.chatCount})</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteWorkspaceClick(ws._id, e)}
                                                            className="opacity-0 group-hover/item:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                                                            title="Delete Workspace"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <div className="border-t border-slate-900/50 dark:border-white/5 my-1.5" />

                                                {/* Add Workspace */}
                                                <button
                                                    onClick={() => {
                                                        setShowCreateWorkspace(true);
                                                        setShowWorkspaceSelector(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-left transition-colors"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    Create Workspace
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Sub-Filters Row */}
                                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border border-slate-900/60 bg-slate-950/40">
                                    {[
                                        { id: "active", label: "Active" },
                                        { id: "favorites", label: "Favorites" },
                                        { id: "archived", label: "Archived" }
                                    ].map((subFilter) => {
                                        const isActive = listFilter === subFilter.id;
                                        return (
                                            <button
                                                key={subFilter.id}
                                                onClick={() => setListFilter(subFilter.id)}
                                                className={`rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                    isActive
                                                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/20 font-extrabold"
                                                        : "text-slate-500 hover:text-slate-350"
                                                }`}
                                            >
                                                {subFilter.label}
                                            </button>
                                        );
                                    })}
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
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSearchPage(1);
                                        }}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                                        onKeyDown={handleSearchSubmit}
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
                            <div data-lenis-prevent className="flex-1 overflow-y-auto px-4 pb-4 space-y-3.5 scrollbar-none">
                                {searchQuery.trim() ? (
                                    /* Search Panel Results View */
                                    <div className="space-y-4">
                                        
                                        {/* Date Filters Row */}
                                        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl border border-slate-900/60 bg-slate-950/40">
                                            {[
                                                { id: "anytime", label: "All" },
                                                { id: "today", label: "Today" },
                                                { id: "week", label: "7d" },
                                                { id: "month", label: "30d" }
                                            ].map((filter) => {
                                                const isActive = dateFilter === filter.id;
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        onClick={() => {
                                                            setDateFilter(filter.id);
                                                            setSearchPage(1);
                                                        }}
                                                        className={`rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                            isActive
                                                                ? "bg-purple-600/20 text-purple-300 border border-purple-500/20 font-extrabold"
                                                                : "text-slate-500 hover:text-slate-350"
                                                        }`}
                                                    >
                                                        {filter.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {isSearchLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
                                                <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Searching Nodes...</span>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="space-y-2">
                                                {searchResults.map((result) => (
                                                    <div
                                                        key={result.chatId}
                                                        onClick={() => {
                                                            onSelectChat(result.chatId);
                                                            saveRecentSearch(searchQuery);
                                                        }}
                                                        className={`group flex flex-col rounded-xl p-3 border border-slate-900 bg-slate-950/20 hover:bg-slate-900/40 cursor-pointer transition-all hover:border-slate-800 ${
                                                            currentChatId === result.chatId ? "border-purple-500/20 bg-purple-500/5" : ""
                                                        }`}
                                                    >
                                                        {/* Result Title */}
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                                            <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                                                {highlightText(result.title, searchQuery)}
                                                            </span>
                                                        </div>

                                                        {/* Snippets list */}
                                                        {result.matches && result.matches.length > 0 && (
                                                            <div className="mt-2 pl-5 border-l border-slate-900/60 pr-1 space-y-1.5">
                                                                {result.matches.map((m, idx) => (
                                                                    <div key={idx} className="text-[10px] leading-relaxed text-slate-500">
                                                                        <span className="font-bold text-purple-400/80 mr-1">
                                                                            {m.role === "user" ? "You:" : "AI:"}
                                                                        </span>
                                                                        <span>{highlightText(m.snippet, searchQuery)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Search Pagination */}
                                                {searchPagination.pages > 1 && (
                                                    <div className="flex items-center justify-between pt-2">
                                                        <button
                                                            disabled={searchPage === 1}
                                                            onClick={() => setSearchPage(prev => Math.max(1, prev - 1))}
                                                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-30 transition-opacity"
                                                        >
                                                            Prev
                                                        </button>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            Page {searchPage} of {searchPagination.pages}
                                                        </span>
                                                        <button
                                                            disabled={searchPage === searchPagination.pages}
                                                            onClick={() => setSearchPage(prev => Math.min(searchPagination.pages, prev + 1))}
                                                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-30 transition-opacity"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Empty State */
                                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center">
                                                    <Search className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <h5 className="text-xs font-bold text-slate-400">No matches found</h5>
                                                    <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] leading-relaxed">
                                                        Check spelling or clear filters. Ensure you are searching words rather than single letters.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Recent Searches & Regular Chat List View */
                                    <div className="space-y-3.5">
                                        {/* Recent Searches Header (Only show if focused and query empty) */}
                                        {isInputFocused && recentSearches.length > 0 && (
                                            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-3 space-y-2">
                                                <div className="flex items-center justify-between text-[9px] tracking-widest uppercase font-black text-slate-500">
                                                    <span>Recent Searches</span>
                                                    <button 
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // prevent blur
                                                            localStorage.removeItem("recentSearches");
                                                            setRecentSearches([]);
                                                        }}
                                                        className="hover:text-red-400 text-slate-600"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {recentSearches.map((term, i) => (
                                                        <button
                                                            key={i}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); // prevent blur
                                                                setSearchQuery(term);
                                                                performSearch(term, 1);
                                                            }}
                                                            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-900 hover:border-slate-800 transition-colors"
                                                        >
                                                            {term}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <AnimatePresence initial={false}>
                                            {pinnedFilteredList.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-[9px] font-black tracking-widest uppercase text-slate-500 pl-2">Pinned Sessions</div>
                                                    {pinnedFilteredList.map((chat) => {
                                                        const isActive = currentChatId === chat._id;
                                                        return (
                                                            <motion.div
                                                                key={chat._id}
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                                className={`group relative flex items-center justify-between rounded-xl p-3 text-xs font-bold transition-all border-l-2 border-amber-500 bg-amber-500/5 ${
                                                                    isActive 
                                                                        ? isDarkMode 
                                                                            ? "bg-slate-900/90 text-white shadow-md border-amber-400" 
                                                                            : "bg-white text-slate-900 shadow-md border-amber-500"
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
                                                                            <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-amber-400" : "text-slate-500 group-hover:text-amber-450"}`} />
                                                                            <span className="truncate">{chat.title || "Untitled Chat"}</span>
                                                                        </button>
                                                                        
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                                                                            {/* Pin Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleTogglePin(chat._id, e)} 
                                                                                className="p-1 rounded transition-colors text-amber-400 hover:bg-slate-850"
                                                                                title="Unpin Chat"
                                                                            >
                                                                                <Pin className="h-3 w-3" style={{ fill: "currentColor" }} />
                                                                            </button>

                                                                            {/* Favorite Star */}
                                                                            <button 
                                                                                onClick={(e) => handleToggleFavoriteClick(chat._id, e)} 
                                                                                className={`p-1 rounded transition-colors ${chat.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-amber-400 hover:bg-slate-850"}`}
                                                                                title={chat.isFavorite ? "Unstar Chat" : "Star Chat"}
                                                                            >
                                                                                <Star className="h-3 w-3" style={{ fill: chat.isFavorite ? "currentColor" : "none" }} />
                                                                            </button>

                                                                            {/* Archive Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleToggleArchiveClick(chat._id, e)} 
                                                                                className={`p-1 rounded transition-colors ${chat.isArchived ? "text-purple-400" : "text-slate-500 hover:text-purple-450 hover:bg-slate-850"}`}
                                                                                title={chat.isArchived ? "Unarchive Chat" : "Archive Chat"}
                                                                            >
                                                                                <Archive className="h-3 w-3" />
                                                                            </button>

                                                                            {/* Duplicate Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleDuplicateChatClick(chat._id, e)} 
                                                                                className="p-1 rounded transition-colors text-slate-500 hover:text-blue-450 hover:bg-slate-855"
                                                                                title="Duplicate Chat"
                                                                            >
                                                                                <Copy className="h-3 w-3" />
                                                                            </button>

                                                                            {/* Move to Workspace Folder */}
                                                                            <div className="relative">
                                                                                <button 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setMovingChatId(movingChatId === chat._id ? null : chat._id);
                                                                                    }} 
                                                                                    className="p-1 rounded transition-colors text-slate-500 hover:text-purple-455 hover:bg-slate-850"
                                                                                    title="Move to Workspace"
                                                                                >
                                                                                    <Folder className="h-3 w-3" />
                                                                                </button>
                                                                                {movingChatId === chat._id && (
                                                                                    <div className="absolute right-0 top-6 z-50 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-2xl flex flex-col gap-1 w-44">
                                                                                        <div className="px-2 py-1 text-[8px] font-black uppercase text-slate-500 tracking-wider">Move to:</div>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleMoveChat(chat._id, null); }}
                                                                                            className="text-[10px] text-left font-semibold p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
                                                                                        >
                                                                                            Unassigned Inbox
                                                                                        </button>
                                                                                        {workspaces.map((ws) => (
                                                                                            <button
                                                                                                key={ws._id}
                                                                                                onClick={(e) => { e.stopPropagation(); handleMoveChat(chat._id, ws._id); }}
                                                                                                className="text-[10px] text-left font-semibold p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                                                                                            >
                                                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ws.color }} />
                                                                                                <span className="truncate">{ws.name}</span>
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <button 
                                                                                onClick={() => startEditing(chat)} 
                                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-blue-400 hover:bg-slate-850" : "text-slate-400 hover:text-blue-550 hover:bg-slate-200"}`}
                                                                                title="Rename Session"
                                                                            >
                                                                                <Edit2 className="h-3 w-3" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => onDeleteChatSession(chat._id)} 
                                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-slate-850" : "text-slate-400 hover:text-red-550 hover:bg-slate-200"}`}
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
                                                </div>
                                            )}

                                            {regularFilteredList.length > 0 && (
                                                <div className="space-y-2 pt-2">
                                                    {pinnedFilteredList.length > 0 && (
                                                        <div className="text-[9px] font-black tracking-widest uppercase text-slate-500 pl-2">Recent Sessions</div>
                                                    )}
                                                    {regularFilteredList.map((chat) => {
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
                                                                        
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                                                                            {/* Pin Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleTogglePin(chat._id, e)} 
                                                                                className="p-1 rounded transition-colors text-slate-500 hover:text-amber-400 hover:bg-slate-850"
                                                                                title="Pin Chat"
                                                                            >
                                                                                <Pin className="h-3 w-3" />
                                                                            </button>

                                                                            {/* Favorite Star */}
                                                                            <button 
                                                                                onClick={(e) => handleToggleFavoriteClick(chat._id, e)} 
                                                                                className={`p-1 rounded transition-colors ${chat.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-amber-400 hover:bg-slate-850"}`}
                                                                                title={chat.isFavorite ? "Unstar Chat" : "Star Chat"}
                                                                            >
                                                                                <Star className="h-3 w-3" style={{ fill: chat.isFavorite ? "currentColor" : "none" }} />
                                                                            </button>

                                                                            {/* Archive Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleToggleArchiveClick(chat._id, e)} 
                                                                                className={`p-1 rounded transition-colors ${chat.isArchived ? "text-purple-400" : "text-slate-500 hover:text-purple-450 hover:bg-slate-850"}`}
                                                                                title={chat.isArchived ? "Unarchive Chat" : "Archive Chat"}
                                                                            >
                                                                                <Archive className="h-3 w-3" />
                                                                            </button>

                                                                            {/* Duplicate Chat */}
                                                                            <button 
                                                                                onClick={(e) => handleDuplicateChatClick(chat._id, e)} 
                                                                                className="p-1 rounded transition-colors text-slate-500 hover:text-blue-450 hover:bg-slate-850"
                                                                                title="Duplicate Chat"
                                                                            >
                                                                                <Copy className="h-3 w-3" />
                                                                            </button>

                                                                            {/* Move to Workspace Folder */}
                                                                            <div className="relative">
                                                                                <button 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setMovingChatId(movingChatId === chat._id ? null : chat._id);
                                                                                    }} 
                                                                                    className="p-1 rounded transition-colors text-slate-500 hover:text-purple-450 hover:bg-slate-850"
                                                                                    title="Move to Workspace"
                                                                                >
                                                                                    <Folder className="h-3 w-3" />
                                                                                </button>
                                                                                {movingChatId === chat._id && (
                                                                                    <div className="absolute right-0 top-6 z-50 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-2xl flex flex-col gap-1 w-44">
                                                                                        <div className="px-2 py-1 text-[8px] font-black uppercase text-slate-500 tracking-wider">Move to:</div>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleMoveChat(chat._id, null); }}
                                                                                            className="text-[10px] text-left font-semibold p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
                                                                                        >
                                                                                            Unassigned Inbox
                                                                                        </button>
                                                                                        {workspaces.map((ws) => (
                                                                                            <button
                                                                                                key={ws._id}
                                                                                                onClick={(e) => { e.stopPropagation(); handleMoveChat(chat._id, ws._id); }}
                                                                                                className="text-[10px] text-left font-semibold p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                                                                                            >
                                                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ws.color }} />
                                                                                                <span className="truncate">{ws.name}</span>
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <button 
                                                                                onClick={() => startEditing(chat)} 
                                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-blue-400 hover:bg-slate-850" : "text-slate-400 hover:text-blue-550 hover:bg-slate-200"}`}
                                                                                title="Rename Session"
                                                                            >
                                                                                <Edit2 className="h-3 w-3" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => onDeleteChatSession(chat._id)} 
                                                                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-slate-850" : "text-slate-400 hover:text-red-550 hover:bg-slate-200"}`}
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
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {chatList?.length === 0 && (
                                            <div className={`p-8 text-center text-xs font-semibold ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
                                                No active sessions
                                            </div>
                                        )}
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

            {/* Create Workspace Modal */}
            <AnimatePresence>
                {showCreateWorkspace && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode 
                                    ? "border-slate-850 bg-slate-950 text-slate-200 shadow-black/85" 
                                    : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Create Workspace</h3>
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateWorkspace(false)} 
                                    className="text-slate-500 hover:text-white hover:scale-105 transition-transform"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Workspace Name</label>
                                    <input
                                        type="text"
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        placeholder="e.g. Coding, College, Projects"
                                        required
                                        className={`w-full rounded-xl px-3.5 py-2 text-xs font-semibold outline-none border transition-all ${
                                            isDarkMode 
                                                ? "bg-slate-900/60 border-slate-850 focus:border-purple-500/80 text-white" 
                                                : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
                                        }`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Description (Optional)</label>
                                    <textarea
                                        value={newWorkspaceDesc}
                                        onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                                        placeholder="Summarize workspace's purpose..."
                                        rows={2}
                                        className={`w-full rounded-xl px-3.5 py-2 text-xs font-semibold outline-none border transition-all ${
                                            isDarkMode 
                                                ? "bg-slate-900/60 border-slate-850 focus:border-purple-500/80 text-white" 
                                                : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
                                        }`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Color</label>
                                    <div className="flex gap-2.5">
                                        {["#a855f7", "#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4"].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewWorkspaceColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                                    newWorkspaceColor === c ? "scale-110 border-white" : "border-transparent"
                                                }`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateWorkspace(false)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                                            isDarkMode 
                                                ? "border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white" 
                                                : "border-slate-200 hover:bg-slate-50 text-slate-650"
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Model Management Modal */}
            <AnimatePresence>
                {showModelManager && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode 
                                    ? "border-slate-850 bg-slate-950 text-slate-200 shadow-black/85" 
                                    : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Model Management Settings</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Switch engine profiles and select generation targets instantly.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowModelManager(false)} 
                                    className="text-slate-500 hover:text-white hover:scale-105 transition-transform"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tab Selectors */}
                            <div className="flex gap-2 p-1 rounded-xl bg-slate-900/40 border border-slate-900/60 mb-5">
                                <button
                                    onClick={() => setModelTab("online")}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                        modelTab === "online"
                                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                                            : "text-slate-500 hover:text-slate-350"
                                    }`}
                                >
                                    Cloud Engines (Online)
                                </button>
                                <button
                                    onClick={() => {
                                        setModelTab("offline");
                                        refreshOllama();
                                    }}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                        modelTab === "offline"
                                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                                            : "text-slate-500 hover:text-slate-350"
                                    }`}
                                >
                                    Local Nodes (Offline)
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="max-h-[350px] overflow-y-auto scrollbar-none pr-1">
                                {modelTab === "online" ? (
                                    <div className="space-y-4">
                                        {/* Gemini Direct Cards */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Google Gemini Models</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Optimized for speed and efficiency" },
                                                    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Optimized for complex coding & logic" }
                                                ].map((m) => {
                                                    const isActive = onlineModel === m.id;
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setOnlineModel(m.id)}
                                                            className={`text-left p-3.5 rounded-xl border transition-all ${
                                                                isActive
                                                                    ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                                                                    : "border-slate-900 bg-slate-950/20 hover:border-slate-800"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-xs font-bold text-white">{m.name}</span>
                                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                                                            </div>
                                                            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">{m.desc}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* OpenRouter Inputs */}
                                        <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">OpenRouter Integration</label>
                                                {onlineModel.includes("/") && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Active</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customOpenRouterModel}
                                                    onChange={(e) => setCustomOpenRouterModel(e.target.value)}
                                                    placeholder="e.g. meta-llama/llama-3-8b-instruct:free"
                                                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none border transition-all ${
                                                        isDarkMode 
                                                            ? "bg-slate-900/60 border-slate-850 focus:border-purple-500/80 text-white" 
                                                            : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
                                                    }`}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (customOpenRouterModel.trim()) {
                                                            setOnlineModel(customOpenRouterModel.trim());
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                                                Enter any valid model identifier from OpenRouter. This will override Gemini Direct when Cloud Engine is selected.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Offline Section */
                                    <div className="space-y-3">
                                        {!ollamaStatus.running ? (
                                            <div className="text-center py-6 px-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                                                <p className="text-xs font-bold text-red-400">Local Node Server Offline</p>
                                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                                    Ensure Ollama is running locally at <code className="text-purple-400 font-mono">http://localhost:11434</code>. Pull models via the terminal using command <code className="text-purple-400 font-mono">ollama pull &lt;model&gt;</code>.
                                                </p>
                                                <button
                                                    onClick={refreshOllama}
                                                    className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-350 bg-slate-900 hover:text-white rounded-lg border border-slate-800 transition-colors"
                                                >
                                                    Retry Connection
                                                </button>
                                            </div>
                                        ) : ollamaModels.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <p className="text-xs font-bold">No Models Installed</p>
                                                <p className="text-[9px] mt-1">Pull an Ollama model using your terminal CLI to run chat sessions offline.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {ollamaModels.map((m) => {
                                                    const isActive = ollamaModel === m.name;
                                                    const gSize = (m.size / (1024 * 1024 * 1024)).toFixed(2);
                                                    const ramEst = ((m.size / (1024 * 1024 * 1024)) + 1.8).toFixed(1);
                                                    const quant = m.details?.quantization_level || "GGUF";
                                                    const params = m.details?.parameter_size || "Unknown";
                                                    
                                                    return (
                                                        <div
                                                            key={m.name}
                                                            onClick={() => setOllamaModel(m.name)}
                                                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                                                                isActive
                                                                    ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                                                                    : "border-slate-900 bg-slate-950/20 hover:border-slate-850"
                                                            }`}
                                                        >
                                                            <div className="min-w-0 pr-4 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-extrabold text-white truncate max-w-[200px]">{m.name}</span>
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded-md">
                                                                        {params} Params
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-x-2 text-[9px] text-slate-500 font-semibold">
                                                                    <span>RAM needed: <strong className="text-purple-400 font-bold">{ramEst} GB</strong></span>
                                                                    <span>•</span>
                                                                    <span>Disk size: {gSize} GB</span>
                                                                    <span>•</span>
                                                                    <span>Quant: {quant}</span>
                                                                </div>
                                                                <div className="text-[8px] text-slate-600 font-semibold">
                                                                    Last Modified: {formatRelativeTime(m.modified_at)}
                                                                </div>
                                                            </div>

                                                            <div className="shrink-0 flex items-center gap-2">
                                                                {isActive ? (
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 border border-slate-900 px-2 py-0.5 rounded-md">
                                                                        Ready
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 mt-5 flex justify-end">
                                <button
                                    onClick={() => setShowModelManager(false)}
                                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-450 hover:text-white bg-slate-900/80 rounded-xl hover:bg-slate-900 border border-slate-850"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Workspaces Dashboard Modal */}
            <AnimatePresence>
                {showWorkspacesModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode ? "border-slate-855 bg-slate-950 text-slate-200 shadow-black/85" : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">AI Workspaces</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Organize related conversations, prompt configs, and project flows.</p>
                                </div>
                                <button onClick={() => setShowWorkspacesModal(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Active Workspaces ({workspaces.length})</span>
                                    <button 
                                        onClick={() => { setShowCreateWorkspace(true); setShowWorkspacesModal(false); }}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        Create New
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-slate-950/20 text-xs font-bold">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                            Inbox (Unassigned)
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded-md">
                                            {unassignedCount} Chats
                                        </span>
                                    </div>

                                    {workspaces.map((ws) => (
                                        <div key={ws._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-800 transition-all text-xs font-bold">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ws.color }} />
                                                <span>{ws.name}</span>
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded-md">
                                                    {getWorkspaceChatCount(ws._id)} Chats
                                                </span>
                                                <button 
                                                    onClick={(e) => handleDeleteWorkspaceClick(ws._id, e)}
                                                    className="text-red-500 hover:text-red-400"
                                                    title="Delete Workspace"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 mt-5 flex justify-end">
                                <button onClick={() => setShowWorkspacesModal(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-450 hover:text-white bg-slate-900/80 rounded-xl border border-slate-855">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Documents Dashboard Modal */}
            <AnimatePresence>
                {showDocumentsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode ? "border-slate-855 bg-slate-950 text-slate-200 shadow-black/85" : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Grounding Knowledge Vault</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Manage files, indexes, and document collections used for RAG grounding.</p>
                                </div>
                                <button onClick={() => setShowDocumentsModal(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>

                            {allDocsLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
                                    <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading files...</span>
                                </div>
                            ) : allDocs.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                                    <p className="text-xs font-bold">No Documents Indexed</p>
                                    <p className="text-[9px] mt-1">Upload files using the paperclip button in your chat interface to build your vault.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                                    {allDocs.map((doc) => (
                                        <div key={doc._id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-855 transition-all text-xs">
                                            <div className="min-w-0 pr-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                    <span className="font-extrabold text-white truncate max-w-[200px]">{doc.name}</span>
                                                </div>
                                                <div className="text-[9px] text-slate-500 font-semibold">
                                                    Size: {(doc.size / 1024).toFixed(1)} KB • Type: {doc.type.split('/')[1] || doc.type}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (window.confirm(`Delete ${doc.name}?`)) {
                                                        try {
                                                            await deleteDocument(doc._id);
                                                            loadAllDocs();
                                                        } catch (err) {
                                                            alert("Failed to delete document: " + err.message);
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                                title="Delete document"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 mt-5 flex justify-end">
                                <button onClick={() => setShowDocumentsModal(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-450 hover:text-white bg-slate-900/80 rounded-xl border border-slate-855">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Downloads & Backup Manager Modal */}
            <AnimatePresence>
                {showDownloadsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode ? "border-slate-855 bg-slate-950 text-slate-200 shadow-black/85" : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Downloads & Backups</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Pull local weights, export backups, and restore workspace chat sessions.</p>
                                </div>
                                <button onClick={() => setShowDownloadsModal(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="space-y-5 max-h-[350px] overflow-y-auto scrollbar-none pr-1">
                                {/* Local Model Puller */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Ollama Local Model Downloader</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={pullModelName}
                                            onChange={(e) => setPullModelName(e.target.value)}
                                            placeholder="e.g. deepseek-r1:8b, mistral, llama3"
                                            className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none border transition-all ${
                                                isDarkMode ? "bg-slate-900/60 border-slate-855 focus:border-purple-500/80 text-white" : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
                                            }`}
                                        />
                                        <button
                                            onClick={handlePullModel}
                                            disabled={isPulling}
                                            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all disabled:opacity-55"
                                        >
                                            {isPulling ? "Pulling..." : "Pull Node"}
                                        </button>
                                    </div>
                                    {pullProgress && (
                                        <p className="text-[9px] font-bold text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/15 leading-relaxed">{pullProgress}</p>
                                    )}
                                    <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                                        Downloads node weights directly via your local Ollama runner setup. Ensure Ollama is active.
                                    </p>
                                </div>

                                {/* Backup Export/Import */}
                                <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 space-y-3.5">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Backup & Restore Configurations</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleExport}
                                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-855 hover:bg-slate-900/10 transition-all text-xs font-bold gap-1.5"
                                        >
                                            <DownloadCloud className="w-5 h-5 text-purple-400" />
                                            <span>Export All Chats</span>
                                        </button>

                                        <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-855 hover:bg-slate-900/10 transition-all text-xs font-bold gap-1.5 cursor-pointer">
                                            <Upload className="w-5 h-5 text-purple-400" />
                                            <span>Import Backup</span>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleImportFile}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 mt-5 flex justify-end">
                                <button onClick={() => setShowDownloadsModal(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-450 hover:text-white bg-slate-900/80 rounded-xl border border-slate-855">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Unified Settings Control Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl ${
                                isDarkMode ? "border-slate-855 bg-slate-950 text-slate-200 shadow-black/85" : "border-slate-200 bg-white text-slate-800"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-slate-900/50 dark:border-white/5 pb-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">Workspace Settings</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Customize identity badges, theme preferences, and clean database structures.</p>
                                </div>
                                <button onClick={() => setShowSettingsModal(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="space-y-4 max-h-[350px] overflow-y-auto scrollbar-none pr-1">
                                {/* Profile Identity Section */}
                                {user && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Avatar Badge Profile</label>
                                        <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900/20 dark:bg-black/20 rounded-xl">
                                            {AVATARS.map((avatar) => {
                                                const isCurrent = user.avatar === avatar;
                                                return (
                                                    <button
                                                        key={avatar}
                                                        onClick={() => handleSelectAvatar(avatar)}
                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all ${
                                                            isCurrent ? "border-purple-500 bg-purple-500/10 text-white" : "border-slate-800 bg-slate-955 hover:bg-slate-900"
                                                        }`}
                                                    >
                                                        {avatar === "Bot" ? <Bot className="h-4 w-4 text-purple-400" /> : avatar === "User" ? <UserIcon className="h-4 w-4 text-purple-400" /> : avatar}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Security / Dark Mode */}
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-slate-950/20 text-xs font-bold">
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                        Interactive Theme Sync
                                    </span>
                                    <button 
                                        onClick={_toggleDarkMode}
                                        className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/15"
                                    >
                                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                                    </button>
                                </div>

                                {/* Purge Sessions */}
                                {user && onClearChat && (
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-slate-950/20 text-xs font-bold">
                                        <span className="flex items-center gap-2">
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            Purge Conversation Log
                                        </span>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm("Purge all conversations globally? This cannot be undone.")) {
                                                    onClearChat();
                                                    setShowSettingsModal(false);
                                                }
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/15"
                                        >
                                            Purge Sessions
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-900/50 dark:border-white/5 pt-4 mt-5 flex justify-end">
                                <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-450 hover:text-white bg-slate-900/80 rounded-xl border border-slate-855">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const formatRelativeTime = (isoString) => {
    if (!isoString) return "Unknown";
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
        return "Unknown";
    }
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
