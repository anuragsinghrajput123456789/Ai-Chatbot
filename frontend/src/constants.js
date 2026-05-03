import { MessageSquare, Code2, BookOpen, Sparkles } from "lucide-react";

export const MODES = {
  chat: {
    id: "chat",
    label: "Friendly Chat",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/30",
    systemPrompt: "You are KittyTalk, a friendly and helpful AI companion. Keep responses conversational and concise.",
    iconColor: "text-purple-400"
  },
  code: {
    id: "code",
    label: "Code Expert",
    icon: Code2,
    color: "from-emerald-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10",
    borderColor: "border-emerald-500/30",
    systemPrompt: "You are an expert Senior Software Engineer. Provide clean, efficient, and well-commented code. Explain technical concepts clearly.",
    iconColor: "text-emerald-400"
  },
  study: {
    id: "study",
    label: "Study Buddy",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-500/30",
    systemPrompt: "You are a patient academic tutor. Break down complex topics into simple, easy-to-understand steps. Use analogies where possible.",
    iconColor: "text-blue-400"
  },
  creative: {
    id: "creative",
    label: "Creative Muse",
    icon: Sparkles,
    color: "from-orange-500 to-rose-500",
    bgColor: "bg-gradient-to-br from-orange-500/10 to-rose-500/10",
    borderColor: "border-orange-500/30",
    systemPrompt: "You are a creative writer and storyteller. Use evocative language, vivid imagery, and imaginative concepts.",
    iconColor: "text-orange-400"
  }
};
