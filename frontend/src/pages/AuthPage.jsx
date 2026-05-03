import React from "react";
import { Bot, MessageSquareText, ShieldCheck } from "lucide-react";
import Auth from "../components/Auth";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AuthPage = ({ mode, onLogin, isDarkMode, toggleDarkMode }) => {
    const isSignup = mode === "signup";

    return (
        <div className={`flex min-h-screen flex-col ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            <main className="flex flex-1 items-center px-4 py-10">
                <section className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="order-2 space-y-5 text-center lg:order-1 lg:text-left">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                            <Bot className="h-4 w-4 text-purple-400" />
                            {isSignup ? "Create your AI workspace" : "Continue your AI chats"}
                        </div>
                        <h1 className={`text-3xl font-bold leading-tight sm:text-5xl ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                            {isSignup ? "Start chatting with your AI agent today." : "Welcome back to your AI agent."}
                        </h1>
                        <p className={`mx-auto max-w-xl text-base leading-7 lg:mx-0 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {isSignup
                                ? "Create an account to save chat history, switch agent modes, and keep your conversations ready across sessions."
                                : "Login to continue conversations, clear history when needed, and send new messages to your AI assistant."}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoCard Icon={MessageSquareText} title="Saved chat history" isDarkMode={isDarkMode} />
                            <InfoCard Icon={ShieldCheck} title="Secure backend AI calls" isDarkMode={isDarkMode} />
                        </div>
                    </div>

                    <div className="order-1 mx-auto w-full max-w-md lg:order-2">
                        <Auth onLogin={onLogin} isDarkMode={isDarkMode} mode={mode} />
                    </div>
                </section>
            </main>

            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const InfoCard = ({ Icon, title, isDarkMode }) => (
    <div className={`rounded-xl border p-4 ${isDarkMode ? "border-slate-800 bg-slate-900 text-slate-300" : "border-slate-200 bg-white text-slate-700"}`}>
        <Icon className="mb-3 h-5 w-5 text-purple-400" />
        <p className="text-sm font-medium">{title}</p>
    </div>
);

export default AuthPage;
