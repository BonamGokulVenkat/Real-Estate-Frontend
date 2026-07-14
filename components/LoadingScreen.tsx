"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 bg-[#0A192F] flex flex-col items-center justify-center overflow-hidden selection:bg-amber-500/30">
            {/* Background Ambience (Matches your Auth pages) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Animated Loader Rings */}
                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                    {/* Outer Slow Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-[3px] border-r-[3px] border-amber-500/10"
                    />

                    {/* Middle Faster Ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-b-[3px] border-l-[3px] border-amber-500/40"
                    />

                    {/* Inner Solid Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-t-[3px] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    />

                    {/* Center Icon */}
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse absolute" />
                </div>

                {/* Text Area */}
                <div className="text-center space-y-3">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Initializing <span className="text-white/40 italic font-light">Portal</span>
                    </h2>

                    <div className="flex items-center justify-center gap-2">
                        <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
                            Please Wait
                        </span>

                        {/* Animated Ellipsis (...) */}
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2, // Staggers the fading effect
                                        ease: "easeInOut",
                                    }}
                                    className="w-1 h-1 rounded-full bg-amber-500"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}