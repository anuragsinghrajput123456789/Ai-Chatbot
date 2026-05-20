import React from "react";
import { Bot, MessageSquareText, ShieldCheck, Sparkles, Key, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import Auth from "../components/Auth";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AuthPage = ({ mode, onLogin, isDarkMode, toggleDarkMode }) => {
    const isSignup = mode === "signup";

    return (
        <div className={`flex min-h-screen flex-col overflow-hidden font-sans transition-colors duration-500 relative z-10 ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
            
            {/* Cinematic Background Canvas */}
            <div className="cinematic-grid" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-15 mix-blend-screen pointer-events-none bg-gradient-to-tr from-purple-600 to-indigo-600" />
            
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            <main className="flex flex-1 items-center px-6 py-12 relative z-10">
                <section className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    
                    {/* Left Column: Premium SaaS Onboarding Information Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="order-2 space-y-6 text-center lg:order-1 lg:text-left"
                    >
                        <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest shadow-md ${
                            isDarkMode 
                                ? "border-slate-800 bg-slate-900/80 text-purple-300" 
                                : "border-slate-200 bg-white text-purple-600"
                        }`}>
                            <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                            <span>{isSignup ? "Deploy Operator Workspace" : "Boot session link"}</span>
                        </div>

                        <h1 className={`text-4xl font-black leading-tight sm:text-5xl lg:text-6xl ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                            {isSignup ? (
                                <>Access <span className="text-gradient">high-end AI</span> capabilities instantly.</>
                            ) : (
                                <>Resume your <span className="text-gradient">conversation cores</span>.</>
                            )}
                        </h1>

                        <p className={`mx-auto max-w-xl text-xs sm:text-sm font-semibold leading-relaxed lg:mx-0 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {isSignup
                                ? "Deploy an advanced local chatbot interface syncable with MongoDB databases to store your custom models, conversation logs, and provider preferences."
                                : "Authenticate your key parameters to retrieve your custom layout histories, clear sessions, or deploy offline Llama parameters."}
                        </p>

                        {/* Interactive Feature Cards Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-4">
                            <InfoCard 
                                Icon={MessageSquareText} 
                                title="Persistent logs" 
                                desc="Preserve your chat queries across reboots."
                                isDarkMode={isDarkMode} 
                            />
                            <InfoCard 
                                Icon={ShieldCheck} 
                                title="Local Sandbox" 
                                desc="Keep technical workflows locked locally."
                                isDarkMode={isDarkMode} 
                            />
                        </div>
                    </motion.div>

                    {/* Right Column: Premium Auth Card Wrapper */}
                    <div className="order-1 mx-auto w-full max-w-md lg:order-2 flex justify-center">
                        <Auth onLogin={onLogin} isDarkMode={isDarkMode} mode={mode} />
                    </div>
                </section>
            </main>

            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const InfoCard = ({ Icon, title, desc, isDarkMode }) => (
    <div className={`rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-105 border-slate-900/10 dark:border-white/5 shadow-md ${
        isDarkMode ? "glass-panel-dark bg-slate-950/40" : "glass-panel bg-white"
    }`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/15 mb-3.5">
            <Icon className="h-4 w-4 text-purple-400" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest">{title}</p>
        <p className={`mt-1 text-[11px] font-semibold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{desc}</p>
    </div>
);

export default AuthPage;
