import React from "react";
import { Bot, Github, Mail, ShieldCheck } from "lucide-react";

const Footer = ({ isDarkMode }) => {
    return (
        <footer className={`relative z-20 border-t ${isDarkMode ? "border-slate-800 bg-slate-950/80 backdrop-blur-md text-slate-400" : "border-slate-200 bg-white/80 backdrop-blur-md text-slate-500"}`}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-slate-800 to-slate-600 text-white shadow-lg shadow-slate-500/20 transition-transform duration-300 hover:scale-105`}>
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <p className={`text-lg font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}>Chatterbot</p>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-purple-500 mt-0.5">Advanced AI Assistant</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wide">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDarkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                        <ShieldCheck className="h-4 w-4" />
                        Secure AI
                    </span>
                    <a className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isDarkMode ? "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`} href="mailto:support@chatterchatbot.com">
                        <Mail className="h-4 w-4" />
                        Support
                    </a>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isDarkMode ? "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`}>
                        <Github className="h-4 w-4" />
                        MERN Stack
                    </span>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                    <p className="text-xs font-medium">Copyright &copy; 2026 Chatterbot.</p>
                    <p className="text-[10px] opacity-60">All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
