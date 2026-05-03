import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Bot, Heart, Globe, Shield, Sparkles } from "lucide-react";

const About = ({ isDarkMode, toggleDarkMode, user, onLogout }) => {
    return (
        <div className={`min-h-screen w-full font-sans transition-all duration-500 flex flex-col ${isDarkMode ? "bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"}`}>

            <Navbar
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                user={user}
                onLogout={onLogout}
                activeMode={null}
            />

            <main className="flex-1 flex flex-col items-center px-4 py-12 relative z-10 w-full max-w-7xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${isDarkMode ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-white/60 border-purple-200 text-purple-700"}`}>
                        <Sparkles className="w-4 h-4" />
                        <span>Our Mission</span>
                    </div>
                    <h1 className={`text-5xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Redefining AI Interaction
                    </h1>
                    <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        We're building the most intuitive, friendly, and powerful AI chat experience for everyone.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h2 className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                            More Than Just a Chatbot
                        </h2>
                        <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            Chatterchatbot started with a simple idea: AI should be accessible, helpful, and fun. We leverage the power of Google's Gemini models to provide state-of-the-art responses, but we wrap it in an interface that feels human.
                        </p>
                        <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            Whether you're debugging complex code, writing a novel, or just need someone to talk to, our platform adapts to your needs with specialized modes.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 rounded-full" />
                        <div className={`relative p-8 rounded-3xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/60 border-slate-700/50" : "bg-white/60 border-white/50"}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <StatsCard icon={Bot} label="AI Models" value="Gemini 1.5" isDarkMode={isDarkMode} />
                                <StatsCard icon={Globe} label="Support" value="24/7" isDarkMode={isDarkMode} />
                                <StatsCard icon={Heart} label="Users" value="10k+" isDarkMode={isDarkMode} />
                                <StatsCard icon={Shield} label="Privacy" value="100%" isDarkMode={isDarkMode} />
                            </div>
                        </div>
                    </motion.div>
                </div>

            </main>
            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const StatsCard = ({ icon: Icon, label, value, isDarkMode }) => (
    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center ${isDarkMode ? "bg-slate-800/50" : "bg-white/50"}`}>
        <Icon className="w-6 h-6 text-purple-400" />
        <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</div>
        <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
    </div>
);

export default About;
