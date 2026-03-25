"use client";

import Link from "next/link";
import { Mail, Phone, ArrowUpRight, Building2, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

interface Agency {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date_joined?: string;
}

export default function AgencyCard({ agency, index }: { agency: Agency; index: number }) {
  const joined = agency.date_joined
    ? new Date(agency.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/agencies/${agency.id}`} className="block h-full">
        <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5">
          
          {/* Subtle Background Glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />

          <div className="flex items-start justify-between mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl text-white group-hover:text-amber-400 group-hover:border-amber-500/50 transition-all duration-500">
                {agency.name[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-3 h-3 text-[#0A192F]" />
              </div>
            </div>

            {/* Member since badge */}
            {joined && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <CalendarDays className="w-3.5 h-3.5 text-amber-500/70" />
                <span className="text-[10px] font-bold text-white/40 tracking-wider">Since {joined}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
              {agency.name}
            </h3>
            
            {agency.email && (
              <p className="flex items-center gap-2 text-white/40 text-sm font-light">
                <Mail className="w-4 h-4 text-amber-500/60 shrink-0" />
                {agency.email}
              </p>
            )}
            {agency.phone && (
              <p className="flex items-center gap-2 text-white/40 text-sm font-light">
                <Phone className="w-4 h-4 text-amber-500/60 shrink-0" />
                {agency.phone}
              </p>
            )}
          </div>

          <div className="flex items-end justify-end pt-6 border-t border-white/5">
            {/* Action Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:text-[#0A192F] group-hover:border-amber-500 transition-all duration-500 group-hover:rotate-12">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}