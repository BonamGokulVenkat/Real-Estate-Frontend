"use client";
import { motion } from "framer-motion";
import { Building, UserCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignupRoleSelection() {
  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center relative overflow-hidden selection:bg-amber-500/30 p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.12)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-amber-500/50" />
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase">
              Luxora Estates
            </span>
            <div className="h-px w-8 bg-amber-500/50" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl font-light text-white tracking-tight"
          >
            Choose your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Journey</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto"
          >
            Select how you want to interact with our premier luxury real estate platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
          {/* Individual Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/signup/individual" className="block h-full">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl p-8 md:p-10 border border-white/5 hover:border-amber-500/40 transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-black/50">
                <div className="w-20 h-20 bg-[#0A192F] rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-amber-500/30 group-hover:-translate-y-2 transition-all duration-300 shadow-inner">
                  <UserCircle className="w-10 h-10 text-white/50 group-hover:text-amber-500 transition-colors" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-4">Acquire</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                  Discover and acquire dream luxury estates, save your exclusive portfolio, and contact elite agents.
                </p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-amber-500 transition-colors">
                  Continue as Buyer <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Builder Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/signup/builder" className="block h-full">
              <div className="h-full bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl p-8 md:p-10 border border-white/5 hover:border-amber-500/40 transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-black/50">
                <div className="w-20 h-20 bg-[#0A192F] rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-amber-500/30 group-hover:-translate-y-2 transition-all duration-300 shadow-inner">
                  <Building className="w-10 h-10 text-white/50 group-hover:text-amber-500 transition-colors" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-4">List</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                  List your premium properties, manage exclusive viewings, and reach our global network.
                </p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-amber-500 transition-colors">
                  Continue as Seller <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">
            Already registered?
          </span>
          <Link href="/login" className="text-amber-500 hover:text-amber-400 text-xs font-bold uppercase tracking-wider transition-colors ml-3 underline decoration-amber-500/30 underline-offset-4">
            Sign In to Portal
          </Link>
        </motion.div>
      </div>
    </div>
  );
}