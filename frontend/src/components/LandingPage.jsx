
import React from "react";
import { Brain, CheckCircle2, Code2, MessageSquare, Send, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import KittyBot from "./KittyBot";
import Navbar from "./Navbar";

const LandingPage = ({ isDarkMode, toggleDarkMode, user }) => {
    return (
        <div className={`flex min-h-screen w-full flex-col font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />

            <main className="relative flex-1 overflow-x-hidden">
                <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-8 sm:gap-10 sm:py-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                        <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm ${isDarkMode ? "border-slate-800 bg-slate-900/80 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse-slow" />
                            Gemini powered AI agent
                        </div>

                        <h1 className={`max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                            {user ? (
                                <>Hi <span className="text-gradient">{user.username}</span>, let's chat.</>
                            ) : (
                                <><span className="text-gradient">Talk to an AI agent</span> that is ready to help.</>
                            )}
                        </h1>

                        <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {user ? "Pick up where you left off, manage your chat history, and explore new modes." : "Sign in, choose a mode, and start a real chat for coding help, study support, creative writing, or everyday questions."}
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Link
                                to="/chat"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-9 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                            >
                                {user ? "Go to Chat" : "Start chatting free"}
                                <Send className="h-5 w-5" />
                            </Link>
                            {!user && (
                                <Link
                                    to="/login"
                                    className={`inline-flex items-center justify-center rounded-full border px-9 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 ${isDarkMode ? "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700/80 shadow-lg" : "border-slate-200 bg-white/50 text-slate-700 hover:bg-slate-50 shadow-md"}`}
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                            <Badge Icon={Zap} label="Fast replies" isDarkMode={isDarkMode} />
                            <Badge Icon={Brain} label="Smart modes" isDarkMode={isDarkMode} />
                            <Badge Icon={Shield} label="Private API keys" isDarkMode={isDarkMode} />
                        </div>

                        <div className={`mt-7 w-full max-w-2xl rounded-2xl border p-3 shadow-xl sm:mt-8 ${isDarkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
                            <div className="mb-3 flex items-center gap-3 px-1">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>AI agent online</span>
                            </div>
                            <div className={`rounded-xl border p-4 text-left ${isDarkMode ? "border-slate-800 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                                <p className="text-sm">Try after signing in:</p>
                                <div className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                                    <span className="min-w-0 flex-1 truncate text-sm">Explain React hooks with a simple example</span>
                                    <Send className="h-4 w-4 shrink-0 text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="mx-auto flex w-full max-w-xl flex-col gap-5"
                    >
                        <div className={`overflow-hidden rounded-3xl border p-5 shadow-2xl sm:p-8 ${isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                            <div className="flex min-h-[320px] scale-110 items-center justify-center sm:min-h-[400px] sm:scale-125 lg:scale-[1.35]">
                                <KittyBot scale={1.35} />
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-4">
                                <MiniStat value="4" label="Modes" isDarkMode={isDarkMode} />
                                <MiniStat value="24/7" label="Ready" isDarkMode={isDarkMode} />
                                <MiniStat value="AI" label="Agent" isDarkMode={isDarkMode} />
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section id="features" className="mx-auto w-full max-w-7xl px-4 pb-16">
                    <div className="grid gap-4 md:grid-cols-3">
                        <FeatureCard
                            Icon={MessageSquare}
                            title="Natural chat"
                            desc="Ask follow-up questions and keep your history after login."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            Icon={Code2}
                            title="Code help"
                            desc="Use code mode for debugging, explanations, and implementation ideas."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            Icon={CheckCircle2}
                            title="Focused modes"
                            desc="Switch between chat, study, creative, and technical assistance."
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </section>
            </main>

            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const Badge = ({ Icon, label, isDarkMode }) => (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
        <Icon className="h-4 w-4 text-purple-400" />
        {label}
    </div>
);

const MiniStat = ({ value, label, isDarkMode }) => (
    <div className={`rounded-3xl p-5 text-center transition-transform duration-300 hover:scale-105 hover:-translate-y-1 ${isDarkMode ? "glass-panel-dark" : "glass-panel"}`}>
        <p className="text-3xl font-black text-gradient">{value}</p>
        <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
    </div>
);

const FeatureCard = ({ Icon, title, desc, isDarkMode }) => (
    <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`rounded-3xl p-10 transition-all duration-300 ${isDarkMode ? "glass-panel-dark text-white hover:border-purple-500/30" : "glass-panel text-slate-950 hover:border-purple-500/20"}`}
    >
        <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-inner ring-1 ring-purple-500/20`}>
            <Icon className="h-8 w-8 text-purple-500" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className={`mt-4 text-base leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{desc}</p>
    </motion.div>
);

export default LandingPage;
