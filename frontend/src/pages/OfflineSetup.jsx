import React, { useState, useEffect, useCallback } from "react";
import { 
  HardDrive, RefreshCw, Copy, Check, Wifi, WifiOff, Download, 
  Terminal, ShieldAlert, Cpu, CheckCircle2, ChevronRight, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OfflineModelManager } from "../services/OfflineModelManager";
import Layout from "../components/Layout";
import { useChatSettings } from "../context/ChatSettingsContext";

export default function OfflineSetup({ isDarkMode, toggleDarkMode, user, onLogout, chatList, currentChatId, onSelectChat, onNewChat, onDeleteChatSession, onRenameChatSession, onChangeAvatar, handleClearChat }) {
  const settings = useChatSettings();
  const { 
    provider, 
    setProvider, 
    ollamaModel, 
    setOllamaModel, 
    customOllamaModel, 
    setCustomOllamaModel,
    selectedOllamaModel,
    ollamaModels,
    ollamaStatus,
    isOllamaLoading,
    ollamaError,
    refreshOllama
  } = settings;

  const [copiedCmd, setCopiedCmd] = useState("");
  const [activeTab, setActiveTab] = useState("windows"); // windows, mac, linux

  useEffect(() => {
    refreshOllama();
  }, [refreshOllama]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(""), 2000);
    } catch {}
  };

  const selectPlatformUrl = () => {
    if (activeTab === "windows") return "https://ollama.com/download/windows";
    if (activeTab === "mac") return "https://ollama.com/download/mac";
    return "https://ollama.com/download/linux";
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 relative z-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
              <HardDrive className="h-5 w-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Local Node Manager</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Offline Model Workflow & Onboarding</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Configure, install, and select offline language models to chat 100% locally on your computer. 
            No internet, no API keys, and zero telemetry required.
          </p>
        </div>

        {/* Status Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Panel */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-purple-400" />
              Service Connection Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">Ollama API Status</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                  ollamaStatus.running 
                    ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                    : "bg-red-500/15 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${ollamaStatus.running ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  {ollamaStatus.running ? "ONLINE" : "OFFLINE"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">Active Provider Mode</span>
                <button
                  onClick={() => setProvider(provider === "online" ? "offline" : "online")}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all duration-300 ${
                    provider === "offline"
                      ? "bg-purple-600/20 border-purple-500/30 text-purple-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {provider === "offline" ? "LOCAL OLLAMA" : "CLOUD GEMINI"}
                </button>
              </div>

              <div className="border-t border-slate-900 pt-3.5 flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">Selected Model Node</span>
                <span className="text-purple-300 text-xs font-mono font-bold truncate max-w-[200px]">
                  {selectedOllamaModel || "(No model selected)"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                Registry Actions
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Pings local registry tags at <code>http://localhost:11434/api/tags</code> to refresh installed models list and connection status.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshOllama}
                disabled={isOllamaLoading}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-purple-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isOllamaLoading ? "animate-spin" : ""}`} />
                {isOllamaLoading ? "Syncing..." : "Sync Local registry"}
              </button>

              <button
                type="button"
                onClick={() => setProvider("offline")}
                disabled={!ollamaStatus.running}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-30"
              >
                Use Offline Mode
              </button>
            </div>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="space-y-6">
          <h2 className="text-lg font-black tracking-tight text-white">Local Model Onboarding Wizard</h2>

          {/* If Ollama is NOT detected/running */}
          {!ollamaStatus.running ? (
            <div className="space-y-6">
              {/* Step 1: Download Ollama */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full border border-purple-500/20 bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Download Ollama Framework</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        First, download the official Ollama runtime framework for your operating system.
                      </p>
                    </div>

                    {/* OS selector tabs */}
                    <div className="flex rounded-lg border border-slate-900 p-1 w-fit bg-slate-950/50">
                      {["windows", "mac", "linux"].map((os) => (
                        <button
                          key={os}
                          type="button"
                          onClick={() => setActiveTab(os)}
                          className={`rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === os 
                              ? "bg-purple-600 text-white shadow-sm" 
                              : "text-slate-500 hover:text-slate-350"
                          }`}
                        >
                          {os === "windows" ? "Windows" : os === "mac" ? "macOS" : "Linux"}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/80">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ollama Installer Link</span>
                        <p className="text-xs font-mono text-purple-300 truncate max-w-sm sm:max-w-md">
                          {selectPlatformUrl()}
                        </p>
                      </div>

                      <a
                        href={selectPlatformUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-200 transition-colors shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Installer
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Start Service */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full border border-purple-500/20 bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Start Ollama Background Service</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        After installing, ensure the Ollama background daemon is launched and running.
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 flex gap-3 text-xs text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Ollama is not running.</p>
                        <p className="mt-1 text-slate-400">
                          Launch the Ollama app from your Applications folder (macOS), system tray (Windows), 
                          or start it from the command line using:
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 rounded-lg border border-red-500/10 bg-black/60 p-2.5 max-w-sm">
                            <code className="flex-1 text-[11px] font-mono text-red-300">ollama serve</code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard("ollama serve", "serve")}
                              className="p-1 hover:bg-slate-800 rounded transition-colors"
                            >
                              {copiedCmd === "serve" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Checked Steps 1 & 2 Success Indicator */}
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5 backdrop-blur-md flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ollama is Connected & Active</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ollama background engine was successfully detected at <code>http://localhost:11434</code>.
                  </p>
                </div>
              </div>

              {/* Step 3: Models Pulling (Only shown if no models exist) */}
              {ollamaModels.length === 0 ? (
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md space-y-4">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full border border-purple-500/20 bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                      3
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">Pull Local Language Models</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          No models were found installed on your Ollama server. Pull at least one model locally using the CLI to enable offline chat.
                        </p>
                      </div>

                      <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4 flex gap-3 text-xs text-yellow-400">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">No models installed.</p>
                          <p className="mt-0.5 text-slate-400">Please download/pull a model using the commands below.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recommended LLM Downloads</span>
                        
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            { name: "DeepSeek R1 (1.5B)", tag: "deepseek-r1:1.5b", desc: "Ultra fast, high reasoning, small footprint" },
                            { name: "Llama 3 (8B)", tag: "llama3", desc: "Meta's flagship model, excellent generalist" },
                            { name: "Qwen 2.5 (3B)", tag: "qwen2.5:3b", desc: "Highly capable multi-language small model" },
                            { name: "Mistral (7B)", tag: "mistral", desc: "Strong reasoning, developer favorite" }
                          ].map((m) => {
                            const cmd = `ollama pull ${m.tag}`;
                            return (
                              <div key={m.tag} className="border border-slate-900 bg-slate-950 p-4 rounded-xl space-y-3">
                                <div>
                                  <span className="text-xs font-bold text-white block">{m.name}</span>
                                  <span className="text-[10px] text-slate-500 block leading-relaxed mt-0.5">{m.desc}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 rounded-lg border border-slate-900 bg-black/60 px-3 py-2">
                                  <code className="flex-1 text-[10px] font-mono text-purple-300 truncate">{cmd}</code>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(cmd, m.tag)}
                                    className="p-1 hover:bg-slate-900 rounded transition-colors shrink-0"
                                  >
                                    {copiedCmd === m.tag ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Manual input for custom tags */}
                      <div className="border-t border-slate-900 pt-4 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Pull / Run Target</label>
                        <div className="flex gap-2">
                          <input
                            value={customOllamaModel}
                            onChange={(e) => setCustomOllamaModel(e.target.value)}
                            placeholder="Enter a custom tag to use (e.g. phi3, gemma)"
                            className="flex-1 h-10 rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customOllamaModel.trim()) {
                                setOllamaModel(customOllamaModel.trim());
                              }
                            }}
                            className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                          >
                            Set Model
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 4: Model Selection */
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md space-y-6">
                  <div className="flex gap-4">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${
                      selectedOllamaModel
                        ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                        : "border-purple-500/20 bg-purple-500/15 text-purple-400"
                    }`}>
                      {selectedOllamaModel ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">Select Default Offline Model</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Choose one of your locally installed models to handle all future offline conversations.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <select
                            value={ollamaModel}
                            onChange={(e) => {
                              setOllamaModel(e.target.value);
                              setCustomOllamaModel(""); // Clear custom model input if choosing from dropdown
                            }}
                            className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                          >
                            <option value="">Select model tag...</option>
                            {ollamaModels.map((model) => (
                              <option key={model.name} value={model.name}>{model.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <input
                            value={customOllamaModel}
                            onChange={(e) => {
                              setCustomOllamaModel(e.target.value);
                            }}
                            placeholder="Or enter direct custom tag (e.g. phi3)"
                            className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Local Registry List</span>
                        <div className="mt-2 divide-y divide-slate-900/60 max-h-48 overflow-y-auto scrollbar-none pr-1">
                          {ollamaModels.map((model) => {
                            const isSelected = selectedOllamaModel === model.name;
                            return (
                              <div 
                                key={model.name} 
                                onClick={() => {
                                  setOllamaModel(model.name);
                                  setCustomOllamaModel("");
                                }}
                                className={`flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
                                  isSelected ? "bg-purple-600/20 text-purple-300 font-bold border border-purple-500/20" : "hover:bg-slate-900/40 text-slate-400"
                                }`}
                              >
                                <span className="text-xs font-mono">{model.name}</span>
                                <span className="text-[10px] text-slate-500">{(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Instructions on pulling another model */}
                      <div className="border-t border-slate-900 pt-4 space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pulling Additional Models</span>
                        <p className="text-xs text-slate-400">
                          Need a different model? Pull it from the terminal:
                        </p>
                        <div className="flex items-center gap-2 rounded-lg border border-slate-900 bg-black/60 px-3 py-2 max-w-sm">
                          <code className="flex-1 text-[10px] font-mono text-purple-300 truncate">ollama pull deepseek-r1:1.5b</code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("ollama pull deepseek-r1:1.5b", "additional-pull")}
                            className="p-1 hover:bg-slate-900 rounded transition-colors shrink-0"
                          >
                            {copiedCmd === "additional-pull" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
