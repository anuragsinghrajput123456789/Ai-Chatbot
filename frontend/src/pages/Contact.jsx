import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin, Send } from "lucide-react";

const Contact = ({ isDarkMode, toggleDarkMode, user, onLogout }) => {
    return (
        <div className={`min-h-screen w-full font-sans transition-all duration-500 flex flex-col ${isDarkMode ? "bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"}`}>

            <Navbar
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                user={user}
                onLogout={onLogout}
                activeMode={null}
            />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-4xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Get in Touch
                    </h1>
                    <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 w-full">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <ContactCard
                            icon={Mail}
                            title="Email Us"
                            info="support@chatterchatbot.com"
                            desc="For general inquiries and support."
                            isDarkMode={isDarkMode}
                        />
                        <ContactCard
                            icon={MessageCircle}
                            title="Live Chat"
                            info="Available 24/7"
                            desc="Chat with our AI support agent instantly."
                            isDarkMode={isDarkMode}
                        />
                        <ContactCard
                            icon={MapPin}
                            title="Office"
                            info="San Francisco, CA"
                            desc="Come visit our HQ."
                            isDarkMode={isDarkMode}
                        />
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className={`p-8 rounded-3xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/60 border-slate-700/50" : "bg-white/60 border-white/50"}`}
                    >
                        <form className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Name</label>
                                <input type="text" className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? "bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500" : "bg-white border border-slate-200 text-gray-900 placeholder-slate-400"}`} placeholder="Your name" />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Email</label>
                                <input type="email" className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? "bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500" : "bg-white border border-slate-200 text-gray-900 placeholder-slate-400"}`} placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Message</label>
                                <textarea rows={4} className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? "bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500" : "bg-white border border-slate-200 text-gray-900 placeholder-slate-400"}`} placeholder="How can we help?"></textarea>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Send Message
                            </button>
                        </form>
                    </motion.div>
                </div>

            </main>
            <Footer isDarkMode={isDarkMode} />
        </div>
    );
};

const ContactCard = ({ icon: Icon, title, info, desc, isDarkMode }) => (
    <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDarkMode ? "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50" : "bg-white/50 border-slate-200/50 hover:bg-white/80"}`}>
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-slate-700/50 text-purple-400" : "bg-purple-100/50 text-purple-600"}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
                <p className={`font-medium ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>{info}</p>
                <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
            </div>
        </div>
    </div>
);

export default Contact;
