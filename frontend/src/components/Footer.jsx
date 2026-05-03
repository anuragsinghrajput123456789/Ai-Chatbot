import React from "react";
import { Bot, Github, Mail, ShieldCheck } from "lucide-react";

const Footer = ({ isDarkMode }) => {
    return (
        <footer className={`border-t ${isDarkMode ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDarkMode ? "bg-slate-900 text-purple-300" : "bg-slate-100 text-purple-600"}`}>
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-950"}`}>Chatterchatbot</p>
                        <p className="text-xs">AI chat for learning, coding, and everyday ideas.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Secure backend AI calls
                    </span>
                    <a className="inline-flex items-center gap-1.5 transition-colors hover:text-purple-400" href="mailto:support@chatterchatbot.com">
                        <Mail className="h-4 w-4" />
                        Support
                    </a>
                    <span className="inline-flex items-center gap-1.5">
                        <Github className="h-4 w-4" />
                        MERN Ready
                    </span>
                </div>

                <p className="text-xs">Copyright 2026 Chatterchatbot.</p>
            </div>
        </footer>
    );
};

export default Footer;
