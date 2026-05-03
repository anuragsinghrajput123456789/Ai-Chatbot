import React, { useState } from "react";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { registerUser, loginUser } from "../api";

const Auth = ({ onLogin, isDarkMode, mode = "login" }) => {
    const isSignup = mode === "signup";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
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
            setError(err.message);
        }
    };

    return (
        <div className={`w-full max-w-md rounded-2xl border p-5 shadow-xl backdrop-blur-md transition-all duration-500 animate-slide-up sm:p-7 ${isDarkMode ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}>
            <h2 className={`mb-5 text-center text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                {isSignup ? "Create your account" : "Login to Chatterchatbot"}
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 text-sm text-center font-medium animate-shake">
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                {isSignup && (
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${isDarkMode ? "bg-slate-800/60 border-slate-700 focus-within:border-purple-400" : "bg-slate-50 border-slate-200 focus-within:border-purple-400"}`}>
                        <User className="w-5 h-5 text-purple-400" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={`bg-transparent flex-1 outline-none text-sm placeholder-slate-400 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                            required
                        />
                    </div>
                )}

                <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${isDarkMode ? "bg-slate-800/60 border-slate-700 focus-within:border-blue-400" : "bg-slate-50 border-slate-200 focus-within:border-blue-400"}`}>
                    <Mail className="w-5 h-5 text-blue-400" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`bg-transparent flex-1 outline-none text-sm placeholder-slate-400 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                        required
                    />
                </div>

                <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${isDarkMode ? "bg-slate-800/60 border-slate-700 focus-within:border-emerald-400" : "bg-slate-50 border-slate-200 focus-within:border-emerald-400"}`}>
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`bg-transparent flex-1 outline-none text-sm placeholder-slate-400 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                        required
                    />
                </div>

                <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-purple-500">
                    <span>{isSignup ? "Create Account" : "Login"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className={`${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {isSignup ? "Already have an account?" : "New to Chatterchatbot?"}
                </span>
                <Link
                    to={isSignup ? "/login" : "/signup"}
                    className="ml-2 font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-300"
                >
                    {isSignup ? "Login" : "Create Account"}
                </Link>
            </div>
        </div>
    );
};

export default Auth;
