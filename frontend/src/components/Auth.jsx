import React, { useState } from "react";
import { User, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { registerUser, loginUser } from "../api";
import { motion } from "framer-motion";

const Auth = ({ onLogin, isDarkMode, mode = "login" }) => {
    const isSignup = mode === "signup";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            let data;
            if (isSignup) {
                await registerUser(username, email, password);
                data = await loginUser(email, password);
            } else {
                data = await loginUser(email, password);
            }
            onLogin(data);
        } catch (err) {
            setError(err.message || "Authentication credentials rejected.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className={`w-full max-w-md rounded-[2.25rem] border p-6 shadow-2xl backdrop-blur-2xl transition-all duration-700 relative overflow-hidden ${
                isDarkMode 
                    ? "glass-panel-dark border-slate-800/80 bg-[#0d1222]/85 shadow-black/80" 
                    : "glass-panel border-slate-200 bg-white/95"
            }`}
        >
            {/* Ambient inner glow spot */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full filter blur-[40px] opacity-10 pointer-events-none bg-gradient-to-tr from-purple-500 to-pink-500" />
            
            <div className="flex flex-col items-center mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 mb-3 shadow-inner">
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                </div>
                <h2 className={`text-2xl font-black text-center tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                    {isSignup ? "Deploy Operator" : "Operator Authentication"}
                </h2>
                <p className={`mt-1.5 text-xs text-center font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Chatterbot Terminal Core
                </p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/25 text-red-300 text-xs text-center font-semibold"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                {isSignup && (
                    <div className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/25 ${
                        isDarkMode ? "bg-slate-950/60 border-slate-800/80 focus-within:border-purple-500/80" : "bg-slate-50 border-slate-200 focus-within:border-purple-500"
                    }`}>
                        <User className="w-5 h-5 text-purple-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Callsign (Username)"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={`bg-transparent flex-1 outline-none text-xs font-semibold placeholder-slate-500 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                            required
                        />
                    </div>
                )}

                <div className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/25 ${
                    isDarkMode ? "bg-slate-950/60 border-slate-800/80 focus-within:border-purple-500/80" : "bg-slate-50 border-slate-200 focus-within:border-purple-500"
                }`}>
                    <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`bg-transparent flex-1 outline-none text-xs font-semibold placeholder-slate-500 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                        required
                    />
                </div>

                <div className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/25 ${
                    isDarkMode ? "bg-slate-950/60 border-slate-800/80 focus-within:border-purple-500/80" : "bg-slate-50 border-slate-200 focus-within:border-purple-500"
                }`}>
                    <Lock className="w-5 h-5 text-purple-400 shrink-0" />
                    <input
                        type="password"
                        placeholder="Access Key (Password)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`bg-transparent flex-1 outline-none text-xs font-semibold placeholder-slate-500 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                        required
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isLoading}
                    className="relative group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(168,85,247,0.55),0_0_10px_rgba(236,72,153,0.35)]"
                >
                    <span>{isLoading ? "Synchronizing..." : isSignup ? "Deploy Operator" : "Boot Console"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </motion.button>
            </form>

            <div className="mt-6 text-center text-xs">
                <span className={`font-bold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {isSignup ? "Already deployed?" : "New operator?"}
                </span>
                <Link
                    to={isSignup ? "/login" : "/signup"}
                    className="ml-2 font-black uppercase tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-400 transition-all duration-300"
                >
                    {isSignup ? "Log In" : "Register"}
                </Link>
            </div>
        </motion.div>
    );
};

export default Auth;
