import React, { useState } from "react";
import Navbar from "./Navbar";
import { MessageSquarePlus, MessageSquare, Trash2, Edit2, Menu, X, Check, XCircle, Search } from "lucide-react";

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChatList = chatList?.filter(chat => 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

    return (
        <div className={`flex h-[100dvh] w-full flex-col overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" : "bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100"}`}>
            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                activeMode={activeMode}
                onLogout={onLogout}
                onClearChat={onClearChat}
                onChangeAvatar={onChangeAvatar}
            />

            <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
                {/* Sidebar */}
                {user && (
                    <div className={`${isSidebarOpen ? "w-72 border-r" : "w-0 border-0"} flex flex-col transition-all duration-300 overflow-hidden ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onNewChat}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
                                >
                                    <MessageSquarePlus className="h-5 w-5" />
                                    New Chat
                                </button>
                                <button 
                                    onClick={toggleSidebar}
                                    className={`hidden lg:flex p-3 items-center justify-center rounded-xl border transition-all ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "border-slate-300 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className={`relative flex items-center rounded-xl border transition-all ${isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"}`}>
                                <Search className={`ml-3 h-4 w-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full bg-transparent p-2.5 text-sm outline-none transition-all ${isDarkMode ? "text-slate-200 placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"}`}
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery("")}
                                        className={`mr-2 p-1 rounded-full transition-colors ${isDarkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-1 scrollbar-thin">
                            {filteredChatList?.map(chat => (
                                <div
                                    key={chat._id}
                                    className={`group relative flex items-center justify-between rounded-lg p-2.5 text-sm transition-all ${currentChatId === chat._id ? (isDarkMode ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900") : (isDarkMode ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800")}`}
                                >
                                    {editingChatId === chat._id ? (
                                        <div className="flex w-full items-center gap-1">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                autoFocus
                                                className={`w-full flex-1 rounded px-2 py-1 text-xs outline-none ${isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
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
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{chat.title || "New Chat"}</span>
                                            </button>
                                            <div className="hidden items-center gap-1 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                                                <button onClick={() => startEditing(chat)} className={`p-1 ${isDarkMode ? "text-slate-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-500"}`}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => onDeleteChatSession(chat._id)} className={`p-1 ${isDarkMode ? "text-slate-400 hover:text-red-400" : "text-slate-500 hover:text-red-500"}`}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {chatList?.length === 0 && (
                                <div className={`p-4 text-center text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                    No history found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Closed Sidebar Rail (Desktop) */}
                {user && !isSidebarOpen && (
                    <div className={`hidden lg:flex w-14 flex-col items-center py-4 border-r transition-all ${isDarkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
                        <button 
                            onClick={toggleSidebar}
                            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"}`}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Mobile Toggle Button (Absolute) */}
                {user && (
                    <button 
                        onClick={toggleSidebar}
                        className={`lg:hidden absolute left-0 top-4 z-20 rounded-r-xl border border-l-0 p-2 shadow-sm transition-all ${isSidebarOpen ? "translate-x-72" : "translate-x-0"} ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-300 bg-white text-slate-600"}`}
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                )}

                <div className="flex min-w-0 flex-1 flex-col relative h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
