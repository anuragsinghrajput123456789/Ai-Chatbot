import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children, isDarkMode, toggleDarkMode, activeMode, user, onLogout, onClearChat }) => {
    return (
        <div className={`flex h-[100dvh] w-full flex-col overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" : "bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100"}`}>
            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                activeMode={activeMode}
                onLogout={onLogout}
                onClearChat={onClearChat}
            />

            <main className="relative z-10 flex min-h-0 flex-1 flex-col">
                {children}
            </main>
        </div>
    );
};

export default Layout;
