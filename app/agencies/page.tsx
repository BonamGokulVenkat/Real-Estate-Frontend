"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AgencyCard from "@/components/common/AgencyCard";
import { Search, Building2, Users, Award, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Builder {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  date_joined: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AgenciesPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [filtered, setFiltered] = useState<Builder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/builders`);
        if (!res.ok) throw new Error("Failed to load agencies");
        const data: Builder[] = await res.json();
        setBuilders(data);
        setFiltered(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBuilders();
  }, []);

  const handleSearch = () => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(builders);
      return;
    }
    setFiltered(builders.filter((b) => b.name.toLowerCase().includes(q)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── Header Section ── */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-amber-500/50" />
              <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
                The Network
              </span>
              <span className="h-[1px] w-8 bg-amber-500/50" />
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
              Find the Right <span className="text-white/30 italic font-light">Agency</span>
            </h1>
            
            <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              Connect with the industry&apos;s most trusted real estate builders.
              Our partner agencies are curated for their track record of excellence
              and deep knowledge of the luxury market.
            </p>
          </motion.div>
        </div>

        {/* ── Search Bar ── */}
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mb-20">
          <div className="relative flex-grow group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 w-5 h-5 transition-colors" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by builder name..."
              className="h-16 pl-14 pr-6 bg-white/[0.03] border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/50 transition-all"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-16 px-10 bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold rounded-2xl uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-amber-500/10"
          >
            Search Network
          </Button>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-white/40 text-sm">Loading agencies...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Building2 className="w-10 h-10 text-white/20" />
            <p className="text-white/40 text-sm">
              {search ? `No agencies found for "${search}"` : "No agencies registered yet."}
            </p>
          </div>
        )}

        {/* ── Agencies Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {filtered.map((builder, index) => (
              <motion.div
                key={builder.user_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.7 }}
              >
                <AgencyCard
                  agency={{
                    id: builder.user_id,
                    name: builder.name,
                    email: builder.email,
                    phone: builder.phone,
                    date_joined: builder.date_joined,
                  }}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Trust Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[48px] p-12 md:p-20 border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-14 h-14 bg-[#0D2137] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-serif text-xl font-bold">Vetted Partners</h3>
              <p className="text-white/30 text-sm font-light leading-relaxed">Every agency undergoes a strict background check for quality assurance and legal integrity.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-14 h-14 bg-[#0D2137] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-serif text-xl font-bold">Elite Concierge</h3>
              <p className="text-white/30 text-sm font-light leading-relaxed">Direct access to top-tier agents specialized in high-net-worth property acquisition.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-14 h-14 bg-[#0D2137] border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-serif text-xl font-bold">Global Standards</h3>
              <p className="text-white/30 text-sm font-light leading-relaxed">Work with recognized leaders globally acknowledged for their service and portfolio results.</p>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}