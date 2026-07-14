import React, { useState, useRef, useEffect } from "react";
import { Brain, CheckCircle2, Code2, MessageSquare, Send, Shield, Sparkles, Zap, ArrowRight, Activity, Terminal, Star, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import KittyBot from "./KittyBot";
import Navbar from "./Navbar";

const LandingPage = ({ isDarkMode, toggleDarkMode, user }) => {
    const [activeMode, setActiveMode] = useState("chat");
    const [sandboxMessages, setSandboxMessages] = useState([
        { role: "model", text: "Welcome Operator. I am Chatterbot's interactive sandbox console. Toggle any Neural Mode above or submit a custom prompt to test my reaction pathways." }
    ]);
    const [sandboxInput, setSandboxInput] = useState("");
    const [isSandboxThinking, setIsSandboxThinking] = useState(false);
    
    const viewportRef = useRef(null);

    // Scroll sandbox terminal to bottom upon new message
    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }, [sandboxMessages, isSandboxThinking]);

    const handleSandboxSend = (e) => {
        if (e) e.preventDefault();
        if (!sandboxInput.trim() || isSandboxThinking) return;

        const userPrompt = sandboxInput;
        setSandboxInput("");
        setIsSandboxThinking(true);

        // Add user message
        setSandboxMessages(prev => [...prev, { role: "user", text: userPrompt }]);

        // simulated AI response pathways based on selected mode
        setTimeout(() => {
            let botResponse = "";
            if (activeMode === "chat") {
                botResponse = "Cognitive core synchronized. In Friendly Chat mode, I focus on fluid natural conversations, context memory tracking, and immediate conversational summaries. Let's solve your queries!";
            } else if (activeMode === "code") {
                botResponse = "Code synthesis complete. Here is a custom optimized react state hook debouncer:\n\n```javascript\nconst useGlowDebounce = (val, ms = 400) => {\n  const [debounced, setDebounced] = useState(val);\n  useEffect(() => {\n    const h = setTimeout(() => setDebounced(val), ms);\n    return () => clearTimeout(h);\n  }, [val, ms]);\n  return debounced;\n};\n```";
            } else if (activeMode === "study") {
                botResponse = "Study buddy summarizing index context:\n\n1. Deep neural networks employ multi-head self-attention mechanisms.\n2. Local Ollama instances bypass internet dependencies, securing client parameter arrays.";
            } else if (activeMode === "creative") {
                botResponse = "The holographic mesh vibrates, channeling cinematic streams! A story outline presents itself: 'In the center of the grid, a glowing core begins to perceive...'. Let's write the prologue together.";
            }

            setIsSandboxThinking(false);
            simulateTypewriter(botResponse);
        }, 1500);
    };

    const simulateTypewriter = (text) => {
        let current = "";
        let i = 0;

        setSandboxMessages(prev => [...prev, { role: "model", text: "" }]);

        const timer = setInterval(() => {
            if (i < text.length) {
                current += text[i];
                setSandboxMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "model", text: current };
                    return next;
                });
                i++;
            } else {
                clearInterval(timer);
            }
        }, 12);
    };

    const modeThemes = {
        chat: "theme-chat",
        code: "theme-code",
        study: "theme-study",
        creative: "theme-creative"
    };

    const currentThemeClass = modeThemes[activeMode] || "theme-chat";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 220, damping: 24 }
        }
    };

    return (
        <div className={`flex min-h-screen w-full flex-col overflow-x-hidden font-sans transition-colors duration-500 relative z-10 ${currentThemeClass} ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
            
            {/* Cinematic depth panning digital grid backdrop */}
            <div className="cinematic-grid animate-grid-pan" />
            
            {/* Drifting colorful aura underlays that shift automatically */}
            <div 
                className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-25 pointer-events-none transition-all duration-1000 animate-drift-bg-mesh" 
                style={{ background: "radial-gradient(circle, var(--mode-gradient-from) 0%, transparent 70%)", willChange: "transform" }}
            />
            <div 
                className="absolute bottom-12 left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none transition-all duration-1000 animate-drift-bg-mesh" 
                style={{ background: "radial-gradient(circle, var(--mode-gradient-to) 0%, transparent 70%)", animationDelay: "-6s", willChange: "transform" }}
            />

            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} activeMode={activeMode} />

            <main className="relative flex-1">
                {/* Hero Showcase Section */}
                <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-8 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[1.15fr_0.85fr] lg:py-10">
                    
                    {/* Left Column: Title, AI Switcher, Sandbox */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                        <motion.div
                            variants={itemVariants}
                            className={`mb-5 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest shadow-md ${
                                isDarkMode 
                                    ? "border-slate-800 bg-slate-900/80 text-slate-300" 
                                    : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                            <span>Quantum AI Core v3.0</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className={`max-w-4xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl ${
                                isDarkMode ? "text-white" : "text-slate-950"
                            }`}
                        >
                            {user ? (
                                <>Welcome Operator <span className="text-gradient">{user.username}</span>. Synthesize intelligence.</>
                            ) : (
                                <>An immersive <span className="text-gradient">AI operating system</span> at your fingers.</>
                            )}
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                        >
                            {user 
                                ? "Seamlessly scale workflows. Select cloud-grade Gemini nodes or launch offline local parameters protected in your secure workspace." 
                                : "Experience a gorgeous, highly customizable chatbot client packed with dual multi-mode neural architectures, live summaries, and high-fidelity layouts."}
                        </motion.p>

                        {/* Interactive Mode Customizer Selector Widget */}
                        <motion.div variants={itemVariants} className="w-full max-w-lg mt-8 mb-5 text-left">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Activity className="w-3.5 h-3.5 text-purple-400" />
                                <span className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                    Toggle AI Neural Pathways
                                </span>
                            </div>
                            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-2xl border ${isDarkMode ? "bg-slate-950/60 border-slate-900" : "bg-slate-100 border-slate-200"}`}>
                                {[
                                    { id: "chat", label: "Chat Core", icon: MessageSquare },
                                    { id: "code", label: "Code Expert", icon: Code2 },
                                    { id: "study", label: "Study Buddy", icon: Brain },
                                    { id: "creative", label: "Creative Muse", icon: Sparkles }
                                ].map((m) => {
                                    const isSel = activeMode === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setActiveMode(m.id);
                                                setIsSandboxThinking(true);
                                                setTimeout(() => setIsSandboxThinking(false), 900);
                                            }}
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 ${
                                                isSel 
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/60 text-white shadow-[0_0_25px_rgba(168,85,247,0.45),0_0_10px_rgba(236,72,153,0.3)] scale-[1.04]"
                                                    : isDarkMode 
                                                        ? "border-slate-800/40 bg-slate-950/20 text-slate-500 hover:text-slate-200 hover:bg-slate-900" 
                                                        : "border-slate-200 bg-white/60 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            <m.icon className={`h-4 w-4 mb-1.5 ${isSel ? "text-white animate-pulse" : "text-purple-400"}`} />
                                            <span className="text-[9px] font-black uppercase tracking-wider text-center">{m.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Interactive Live Sandbox Terminal Simulator */}
                        <motion.div
                            variants={itemVariants}
                            className={`w-full max-w-xl rounded-2xl border p-4 shadow-2xl text-left relative overflow-hidden ${
                                isDarkMode 
                                    ? "card-panel-dark border-slate-850/80 bg-[#070b16]/75" 
                                    : "card-panel border-slate-250 bg-white/95"
                            }`}
                        >
                            <div className="mb-3.5 flex items-center justify-between px-1 border-b border-slate-900/10 dark:border-white/5 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isSandboxThinking ? "bg-amber-400" : "bg-emerald-400"}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        {isSandboxThinking ? "Synthesizing Node..." : `Sandbox Ready — ${activeMode.toUpperCase()}`}
                                    </span>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                                    Reactive Sandbox
                                </span>
                            </div>

                            {/* Messages viewport */}
                            <div ref={viewportRef} data-lenis-prevent className={`h-40 overflow-y-auto rounded-xl p-3 mb-3 border space-y-3.5 scrollbar-none text-xs font-semibold ${
                                isDarkMode ? "border-slate-900/60 bg-[#050811]/90 text-slate-300" : "border-slate-100 bg-slate-50 text-slate-700"
                            }`}>
                                {sandboxMessages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                        <span className={`text-[8px] uppercase tracking-wider font-bold mb-1 ${isDarkMode ? "text-slate-650" : "text-slate-400"}`}>
                                            {msg.role === "user" ? "Operator" : "Chatterbot"}
                                        </span>
                                        <div className={`rounded-xl px-3 py-2.5 max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : isDarkMode ? "bg-slate-900/80 text-slate-200" : "bg-white text-slate-800 shadow-sm"
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isSandboxThinking && (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 animate-pulse">Thinking...</span>
                                    </div>
                                )}
                            </div>
                            
                            <form onSubmit={handleSandboxSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Submit custom prompt to sandbox..."
                                    value={sandboxInput}
                                    onChange={e => setSandboxInput(e.target.value)}
                                    className={`w-full rounded-xl border py-3 pl-4 pr-12 text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-purple-500/20 ${
                                        isDarkMode 
                                            ? "border-slate-900 bg-slate-950 text-white placeholder-slate-700 focus:border-purple-500" 
                                            : "border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-purple-500"
                                    }`}
                                />
                                <button
                                    type="submit"
                                    disabled={!sandboxInput.trim() || isSandboxThinking}
                                    className={`absolute right-2 p-2 rounded-lg transition-colors ${
                                        sandboxInput.trim() && !isSandboxThinking
                                            ? "text-purple-400 hover:bg-purple-500/10"
                                            : "text-slate-650"
                                    }`}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </motion.div>

                        {/* CTA Actions */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-6 flex flex-col gap-4 sm:flex-row w-full justify-center lg:justify-start z-10"
                        >
                            <Link
                                to="/chat"
                                className="relative group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-9 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(168,85,247,0.45),0_0_8px_rgba(236,72,153,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(168,85,247,0.65),0_0_12px_rgba(236,72,153,0.4)]"
                            >
                                <span>{user ? "Activate Workspace" : "Access chatbot"}</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            {!user && (
                                <Link
                                    to="/login"
                                    className={`inline-flex items-center justify-center rounded-full border px-9 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 ${
                                        isDarkMode 
                                            ? "border-slate-850 bg-slate-900/60 text-slate-200 hover:bg-slate-850 shadow-md hover:text-white" 
                                            : "border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-50 shadow-sm hover:text-slate-900"
                                    }`}
                                >
                                    Log In
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Giant Pulsing Holographic Core */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: "spring", stiffness: 100, damping: 18 }}
                        className="mx-auto flex w-full max-w-xl flex-col items-center justify-center relative z-10 py-6"
                    >
                        {/* Giant futuristic background ambient glow aura behind the floating orb */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full filter blur-[80px] opacity-25 pointer-events-none bg-gradient-to-tr from-purple-500 to-pink-500" />

                        {/* Floating KittyBot Orb directly on the landing page */}
                        <div className="relative py-8 flex items-center justify-center scale-110 sm:scale-125 z-20">
                            <KittyBot scale={1.25} activeMode={activeMode} isThinking={isSandboxThinking} />
                        </div>

                        {/* Floating statistical metric cards */}
                        <div className="mt-14 grid grid-cols-3 gap-3.5 w-full relative z-20">
                            <MiniStat value="4" label="Modes" desc="Technical UI" isDarkMode={isDarkMode} />
                            <Link to="/chat" state={{ selectOffline: true }} className="block hover:no-underline">
                                <MiniStat value="Local" label="Ollama" desc="Offline Node" isDarkMode={isDarkMode} isInteractive={true} />
                            </Link>
                            <MiniStat value="99%" label="Sync" desc="Accuracy" isDarkMode={isDarkMode} />
                        </div>
                    </motion.div>
                </section>

                {/* Tech stack Infinite Scrolling Marquee */}
                <TechMarquee />

                {/* Features Showcase Section */}
                <section id="features" className="mx-auto w-full max-w-7xl px-6 py-14 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4">
                            <Activity className="w-3.5 h-3.5" />
                            <span>System Capabilities</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            Engineered for Premium Conversational Quality
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <FeatureCard
                            Icon={MessageSquare}
                            title="Workspace memory"
                            desc="Sync your entire chat logs, rename session states, and preserve local indexes seamlessly."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            Icon={Code2}
                            title="Code Synthesis"
                            desc="Toggle the 'Code Expert' mode to receive premium technical summaries, syntax highlighting, and unit test guides."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            Icon={Star}
                            title="Adaptive intelligence"
                            desc="Choose Friendly Chat, technical Study Buddy, or Creative Muse to dynamically alter core neural response prompts."
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </section>
            </main>

            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const TechMarquee = () => {
    const techs = [
        { name: "React 19", color: "text-sky-400" },
        { name: "Node.js", color: "text-emerald-400" },
        { name: "Express", color: "text-slate-350" },
        { name: "MongoDB", color: "text-green-500" },
        { name: "Tailwind v4", color: "text-cyan-400" },
        { name: "Framer Motion", color: "text-pink-400" },
        { name: "Google Gemini", color: "text-indigo-400" },
        { name: "Ollama Local", color: "text-purple-450" },
        { name: "Socket.IO", color: "text-slate-200" },
        { name: "Vite JS", color: "text-yellow-400" }
    ];

    const doubleTechs = [...techs, ...techs, ...techs];

    return (
        <div className="w-full overflow-hidden py-6 relative z-10 border-y border-slate-900/10 dark:border-white/5 bg-slate-900/5 dark:bg-slate-950/20 backdrop-blur-sm">
            <div className="flex w-max animate-marquee-scroll hover:[animation-play-state:paused] transition-all">
                {doubleTechs.map((tech, i) => (
                    <div 
                        key={i} 
                        className="mx-6 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 px-6 py-3 text-xs font-black uppercase tracking-widest shadow-inner holographic-surface transition-all duration-300 hover:scale-105"
                    >
                        <span className="w-2.5 h-2.5 rounded-full mr-2.5 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                        <span className={tech.color}>{tech.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MiniStat = ({ value, label, desc, isDarkMode, isInteractive }) => (
    <div className={`rounded-2xl p-4 text-center transition-all duration-300 ${
        isInteractive ? "hover:scale-108 hover:-translate-y-1.5 cursor-pointer active:scale-98 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border-purple-500/40" : "hover:scale-105 hover:-translate-y-1"
    } border glowing-border ${
        isDarkMode ? "card-panel-dark border-slate-850/60 bg-slate-950/40" : "card-panel border-slate-200/50 bg-white"
    }`}>
        <p className="text-2xl font-black text-gradient leading-none">{value}</p>
        <p className={`mt-2.5 text-[9px] font-black uppercase tracking-widest leading-none ${isDarkMode ? "text-slate-350" : "text-slate-800"}`}>{label}</p>
        <p className={`mt-1 text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>{desc}</p>
    </div>
);

const FeatureCard = ({ Icon, title, desc, isDarkMode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`rounded-3xl p-8 border shadow-xl relative overflow-hidden transition-all duration-300 holographic-surface glowing-border ${
            isDarkMode 
                ? "card-panel-dark border-slate-900 text-white hover:border-purple-500/25 shadow-black/40" 
                : "card-panel border-slate-200 text-slate-950 hover:border-purple-500/15"
        }`}
    >
        {/* subtle floating background glowing point */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full filter blur-[35px] opacity-10 pointer-events-none bg-gradient-to-tr from-purple-500 to-pink-500" />

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-inner border border-purple-500/15">
            <Icon className="h-6 w-6 text-purple-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`mt-3.5 text-xs sm:text-sm font-semibold leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{desc}</p>
    </motion.div>
);

export default LandingPage;
