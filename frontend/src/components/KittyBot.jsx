import React from "react";
import { motion } from "framer-motion";

const KittyBot = ({ scale = 1, isThinking = false, activeMode = "chat" }) => {
    // Elegant cinematic presets for each AI Mode
    const modeConfigs = {
        chat: {
            fromColor: "#3b82f6", // blue
            toColor: "#22d3ee",   // cyan
            accentColor: "#6366f1", // indigo
            glow: "rgba(59, 130, 246, 0.45)",
            class: "theme-chat"
        },
        code: {
            fromColor: "#a855f7", // purple
            toColor: "#ec4899",   // pink
            accentColor: "#8b5cf6", // violet
            glow: "rgba(168, 85, 247, 0.45)",
            class: "theme-code"
        },
        study: {
            fromColor: "#10b981", // emerald
            toColor: "#06b6d4",   // cyan
            accentColor: "#3b82f6", // blue
            glow: "rgba(16, 185, 129, 0.45)",
            class: "theme-study"
        },
        creative: {
            fromColor: "#f97316", // orange
            toColor: "#f43f5e",   // rose
            accentColor: "#d946ef", // fuchsia
            glow: "rgba(249, 115, 22, 0.45)",
            class: "theme-creative"
        }
    };

    const currentMode = activeMode && modeConfigs[activeMode] ? activeMode : "chat";
    const config = modeConfigs[currentMode];

    // Soundwaves
    const waveCount = 10;
    const waveBars = Array.from({ length: waveCount });

    return (
        <div
            className={`relative flex flex-col items-center justify-center ${config.class}`}
            style={{ 
                transform: `scale(${scale})`, 
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                perspective: "1000px" 
            }}
        >
            {/* GPU Accelerated Ambient Nebula Mesh Glow Layers */}
            <div 
                className="absolute w-80 h-80 rounded-full filter blur-[50px] opacity-25 mix-blend-screen pointer-events-none transition-all duration-1000 animate-pulse"
                style={{
                    background: `radial-gradient(circle, ${config.fromColor} 0%, transparent 70%)`,
                    transform: isThinking ? 'scale(1.2)' : 'scale(1)',
                    willChange: "transform, opacity"
                }}
            />
            <div 
                className="absolute w-64 h-64 rounded-full filter blur-[35px] opacity-20 mix-blend-screen pointer-events-none transition-all duration-1000 animate-morph-core-secondary"
                style={{
                    background: `radial-gradient(circle, ${config.toColor} 0%, transparent 75%)`,
                    transform: isThinking ? 'scale(1.3) translate(15px, -15px)' : 'scale(1) translate(0px, 0px)',
                    willChange: "transform, opacity"
                }}
            />

            {/* main Quantum Glass sphere container */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center z-10 transition-all duration-500">
                
                {/* SVG liquid distortion filter definition */}
                <svg className="absolute w-0 h-0">
                    <defs>
                        <filter id="neural-liquid-hologram">
                            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" seed="2" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isThinking ? "30" : "18"} xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </defs>
                </svg>

                {/* 3D Tilted Orbital Rings (Holographic HUD Feel) */}
                <div className="absolute inset-[-20px] pointer-events-none z-0" style={{ transformStyle: "preserve-3d" }}>
                    {/* Ring 1 - Outer Cyan Dotted */}
                    <div 
                        className="absolute inset-0 border border-dashed rounded-full opacity-30 animate-orbit-3d"
                        style={{ 
                            borderColor: config.fromColor,
                            willChange: "transform"
                        }}
                    />
                    {/* Ring 2 - Inner Pink/Blue Double */}
                    <div 
                        className="absolute inset-[10px] border-2 border-double rounded-full opacity-20 animate-orbit-3d-reverse"
                        style={{ 
                            borderColor: config.toColor,
                            willChange: "transform"
                        }}
                    />
                    {/* Ring 3 - Outer Diagonal Edge */}
                    <div 
                        className="absolute inset-[-10px] border border-solid rounded-full opacity-10 animate-spin-slow"
                        style={{ 
                            borderColor: config.accentColor,
                            transform: "rotateX(75deg) rotateY(-10deg)",
                            willChange: "transform"
                        }}
                    />
                </div>

                {/* Glassmorphic Outer Sphere Shell */}
                <div 
                    className="absolute inset-0 rounded-full backdrop-blur-[16px] border z-0 shadow-2xl transition-all duration-700"
                    style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderColor: "rgba(255, 255, 255, 0.09)",
                        boxShadow: `0 25px 60px rgba(0, 0, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.06), 0 0 35px ${config.glow}`
                    }}
                />

                {/* Layer 1: liquid Morphing Outer Blob */}
                <div 
                    className="absolute w-32 h-32 rounded-full filter z-10 mix-blend-screen transition-all duration-700 animate-morph-core-primary"
                    style={{
                        filter: "url(#neural-liquid-hologram)",
                        background: `linear-gradient(135deg, ${config.fromColor} 0%, ${config.toColor} 50%, ${config.accentColor} 100%)`,
                        boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.3), 0 0 35px ${config.glow}`,
                        willChange: "border-radius, transform"
                    }}
                />

                {/* Layer 2: Opposing rotating inner morphing blob for dual fluid synthesis */}
                <div 
                    className="absolute w-24 h-24 rounded-full filter z-12 mix-blend-color-dodge transition-all duration-700 animate-morph-core-secondary"
                    style={{
                        filter: "url(#neural-liquid-hologram)",
                        background: `linear-gradient(225deg, ${config.accentColor} 0%, ${config.toColor} 60%, ${config.fromColor} 100%)`,
                        opacity: 0.8,
                        transform: "rotate(180deg)",
                        willChange: "border-radius, transform"
                    }}
                />

                {/* Core atmospheric glare layer */}
                <div className="absolute top-[22%] left-[22%] w-12 h-12 bg-white rounded-full filter blur-[8px] opacity-25 z-20 pointer-events-none" />

                {/* Orbiting Nano Particles */}
                <div className="absolute inset-0 z-30 pointer-events-none">
                    {[
                        { className: "animate-float-particle-1", scale: 0.8, x: -35, y: -25, delay: 0 },
                        { className: "animate-float-particle-2", scale: 0.6, x: 45, y: 15, delay: 1.5 },
                        { className: "animate-float-particle-1", scale: 0.5, x: -15, y: 40, delay: 3 },
                        { className: "animate-float-particle-2", scale: 0.7, x: 30, y: -35, delay: 4.5 }
                    ].map((part, index) => (
                        <div
                            key={index}
                            className={`absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full z-30 ${part.className}`}
                            style={{
                                background: `radial-gradient(circle, #fff 0%, ${config.toColor} 80%)`,
                                transform: `translate(-50%, -50%) translate(${part.x}px, ${part.y}px)`,
                                animationDelay: `${part.delay}s`,
                                scale: part.scale,
                                boxShadow: `0 0 12px ${config.fromColor}`
                            }}
                        />
                    ))}
                </div>

                {/* Ultra-Premium Fusion Core (Pulsing glowing center engine) */}
                <div 
                    className="relative w-5 h-5 rounded-full bg-white z-40 flex items-center justify-center animate-fusion-pulse"
                    style={{
                        '--mode-glow-color': config.fromColor
                    }}
                >
                    <div className="w-2 h-2 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" style={{ backgroundColor: config.fromColor }} />
                </div>
            </div>

            {/* Premium soundwave voice waveforms reactivity deck at the bottom */}
            <div className="mt-9 flex items-end justify-center gap-1.5 h-10 w-48 z-20">
                {waveBars.map((_, index) => {
                    const delay = index * 0.08;
                    const duration = isThinking ? 0.45 + Math.random() * 0.25 : 1.1 + Math.random() * 0.35;
                    const barHeight = isThinking ? [8, 38, 8] : [6, 18, 6];

                    return (
                        <motion.div
                            key={index}
                            animate={{
                                height: barHeight
                            }}
                            transition={{
                                duration: duration,
                                repeat: Infinity,
                                delay: delay,
                                ease: "easeInOut"
                            }}
                            className="w-1 rounded-full pointer-events-none"
                            style={{
                                background: `linear-gradient(to top, ${config.fromColor}, ${config.toColor})`,
                                boxShadow: `0 0 10px ${config.glow}`
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default KittyBot;
