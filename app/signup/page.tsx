"use client";
import { motion } from "framer-motion";
import { Building, UserCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignupRoleSelection() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A192F] flex flex-col items-center justify-center relative overflow-hidden selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 px-4">
        <div className="text-center mb-12 space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              Join Luxora Estates
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            Choose your <span className="text-white/40 italic font-light">Journey</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto"
          >
            Select how you want to interact with the premier luxury estate platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Individual Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/signup/individual" className="block h-full cursor-pointer">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl rounded-[32px] p-8 md:p-10 border border-white/5 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all duration-500">
                  <UserCircle className="w-10 h-10 text-white/50 group-hover:text-amber-500 transition-colors duration-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-3">Individual / Buyer</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                  Looking to acquire or find your dream luxury estate, save favorites, and contact elite agents.
                </p>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-500 group-hover:text-amber-400">
                  Select Role <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Builder Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/signup/builder" className="block h-full cursor-pointer">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl rounded-[32px] p-8 md:p-10 border border-white/5 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all duration-500">
                  <Building className="w-10 h-10 text-white/50 group-hover:text-amber-500 transition-colors duration-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-3">Builder / Seller</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                  List your premium properties, manage listings, and reach our exclusive network of elite clients.
                </p>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-500 group-hover:text-amber-400">
                  Select Role <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 mt-12"
        >
          Already registered?{" "}
          <Link href="/login" className="text-amber-500 hover:text-amber-400 transition-colors ml-1">
            Sign In
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
