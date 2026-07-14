import React, { useState } from "react";
import { Bot, Github, Mail, ShieldCheck, Activity, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Footer = ({ isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setTimeout(() => {
            setEmail("");
            setSubscribed(false);
        }, 3000);
    };

    return (
        <footer className={`relative z-20 border-t ${
            isDarkMode 
                ? "border-slate-900 bg-gradient-to-b from-slate-950/90 to-slate-950 text-slate-400" 
                : "border-slate-200 bg-gradient-to-b from-white/90 to-slate-50 text-slate-500"
        } backdrop-blur-md`}>
            
            {/* Top glowing boundary line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />

            <div className="mx-auto w-full max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_0.9fr] gap-10 border-b border-slate-900/10 dark:border-white/5 pb-10">
                    
                    {/* Column 1: Animated brand identity & AI Heartbeat */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden holographic-surface glowing-border">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-25" />
                                <img src="/bot-logo.png" alt="Bot Logo" className="h-6 w-6 object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                            </div>
                            <div>
                                <p className={`text-lg font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}>Chatterbot</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500">Advanced AI Interface</p>
                            </div>
                        </div>
                        
                        <p className={`text-xs leading-relaxed max-w-sm ${isDarkMode ? "text-slate-550" : "text-slate-500"}`}>
                            Synthesizing state-of-the-art multi-mode visual intelligence locally and in secure cloud-vault environments.
                        </p>

                        {/* Real-time system heartbeat pulse */}
                        <div className="flex items-center gap-2.5 mt-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                Cognitive Systems Functional
                            </span>
                        </div>
                    </div>

                    {/* Column 2: Operator Newsletter Card */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>Newsletter Node</p>
                            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Receive visual updates, code releases, and prompt optimization cards.</p>
                        </div>

                        <form onSubmit={handleSubscribe} className="relative flex items-center max-w-md">
                            <input
                                type="email"
                                placeholder="Enter operator email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full rounded-xl border py-3 pl-4 pr-12 text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-purple-500/20 ${
                                    isDarkMode 
                                        ? "border-slate-850 bg-slate-900/60 text-white placeholder-slate-650 focus:border-purple-500" 
                                        : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500"
                                }`}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-purple-650 to-pink-650 text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
                            >
                                {subscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                        </form>
                    </div>

                    {/* Column 3: Stack Badges & Safety Capsules */}
                    <div className="flex flex-col gap-4 justify-between md:items-end">
                        <div className="flex flex-wrap gap-2 md:justify-end">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                isDarkMode ? "bg-slate-900 border border-slate-800 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-600"
                            }`}>
                                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                                Vault Secure
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                isDarkMode ? "bg-slate-900 border border-slate-800 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-600"
                            }`}>
                                <Github className="h-3.5 w-3.5 text-purple-400 animate-bounce-slow" />
                                MERN core
                            </span>
                        </div>

                        <div className="flex flex-col md:items-end gap-1">
                            <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-350" : "text-slate-800"}`}>Copyright &copy; 2026 Chatterbot Inc.</p>
                            <p className="text-[10px] opacity-50">All cybernetic nodes reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
