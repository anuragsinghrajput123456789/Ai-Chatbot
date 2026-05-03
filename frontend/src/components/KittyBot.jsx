import React from "react";

const KittyBot = ({ scale = 1, isThinking = false }) => {
    return (
        <div
            className="relative flex flex-col items-center transition-all duration-700 animate-float"
            style={{ transform: `scale(${scale})` }}
        >
            {/* Animated background glow */}
            <div className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />

            <div className="relative w-48 h-44 bg-gradient-to-b from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-[3rem] shadow-2xl shadow-purple-500/20 dark:shadow-black/50 z-10 flex flex-col items-center overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-purple-500/30 border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden rounded-[3rem]">
                    <div className="absolute top-4 left-8 w-2 h-2 bg-purple-400/50 rounded-full animate-float delay-100" />
                    <div className="absolute top-10 right-10 w-1 h-1 bg-cyan-400/50 rounded-full animate-float delay-300" />
                    <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-pink-400/50 rounded-full animate-float delay-500" />
                </div>

                {/* Ears with glow */}
                <div className="absolute -top-3 left-4 w-10 h-10 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-tr-3xl transform -rotate-12 z-0 transition-all duration-300 shadow-lg" />
                <div className="absolute -top-3 right-4 w-10 h-10 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-tl-3xl transform rotate-12 z-0 transition-all duration-300 shadow-lg" />

                {/* Face Screen with animated border */}
                <div className="absolute top-6 w-36 h-28 bg-gradient-to-br from-gray-900 via-[#1a1b26] to-gray-900 rounded-[2rem] flex flex-col items-center justify-center z-20 overflow-hidden shadow-inner border border-cyan-500/30 animate-glow">
                    {/* Animated scan line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />

                    {/* Eyes with animation */}
                    <div className="flex gap-6 mb-2">
                        <div className={`relative w-8 h-8 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] ${isThinking ? 'animate-pulse' : ''}`}>
                            <div className={`absolute inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 ${isThinking ? 'animate-ping-slow' : ''}`} />
                        </div>
                        <div className={`relative w-8 h-8 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] ${isThinking ? 'animate-pulse' : ''}`}>
                            <div className={`absolute inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 ${isThinking ? 'animate-ping-slow' : ''}`} />
                        </div>
                    </div>

                    {/* Animated mouth */}
                    <div className="relative">
                        <div className="text-cyan-400 font-bold text-xl mt-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-wave">
                            {isThinking ? "..." : "ω"}
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="absolute bottom-2 right-4 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-200" />
                    </div>
                </div>

                {/* Feet with animation */}
                <div className="absolute bottom-0 w-full flex justify-center gap-8 pb-1 z-20">
                    <div className="relative w-6 h-4 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-t-xl transition-colors duration-300 animate-bounce-slow" />
                    <div className="relative w-6 h-4 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-t-xl transition-colors duration-300 animate-bounce-slow delay-100" />
                </div>

                {/* Energy rings */}
                <div className="absolute -bottom-2 w-24 h-3 rounded-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-sm animate-pulse" />
            </div>

            {/* Surrounding dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500/30 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-cyan-500/30 rounded-full animate-spin-slow reverse" />
        </div>
    );
};

export default KittyBot;
