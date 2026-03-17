"use client";

import { motion } from "framer-motion";
import { User, Heart, Home, FileText, Edit, ShieldCheck, ArrowUpRight } from "lucide-react";
import { users, properties, transactions } from "@/data/dummyData";
import PropertyCard from "@/components/common/PropertyCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const user = users[0]; // Demo: first user
  const saved = properties.filter((p) => user.savedProperties.includes(p.id));
  const userTransactions = transactions.filter((t) => t.buyerId === user.id);

  // Helper to format price to Indian numbering system (Cr/Lakh)
  const formatIndianPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        
        {/* --- Profile Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white/[0.03] backdrop-blur-3xl rounded-[40px] p-8 lg:p-12 border border-white/10 shadow-2xl mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[32px] bg-[#0D2137] border border-white/10 flex items-center justify-center text-4xl font-serif font-bold text-amber-500 shadow-2xl">
                {user.name[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-xl shadow-lg">
                <ShieldCheck className="w-4 h-4 text-[#0A192F]" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-white">{user.name}</h1>
              <p className="text-white/40 text-lg font-light italic font-serif">
                {user.email} <span className="mx-2 opacity-20">|</span> {user.phone}
              </p>
              <div className="pt-2">
                <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
                  {user.role} Member
                </span>
              </div>
            </div>

            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* --- Bento Stats --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Heart, label: "Saved Estates", value: saved.length },
            { icon: Home, label: "Your Listings", value: user.listedProperties.length },
            { icon: FileText, label: "Transactions", value: userTransactions.length },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 text-center group hover:border-amber-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-[#0D2137] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5 text-amber-500" />
              </div>
              <div className="font-serif text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">{s.label}</div>
            </div>
          ))}
        </div>

        {/* --- Saved Properties --- */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <h2 className="font-serif text-3xl font-bold italic text-white/80">Saved Estates</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Curation</div>
          </div>
          
          {saved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {saved.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
              <Heart className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-serif italic text-lg">Your curated collection is empty.</p>
            </div>
          )}
        </section>

        {/* --- Transaction History --- */}
        <section>
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <h2 className="font-serif text-3xl font-bold italic text-white/80">Legacy Transactions</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Ledger</div>
          </div>

          {userTransactions.length > 0 ? (
            <div className="space-y-4">
              {userTransactions.map((t) => {
                const prop = properties.find((p) => p.id === t.propertyId);
                return (
                  <div key={t.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#0D2137] flex items-center justify-center text-amber-500 border border-white/5">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-white group-hover:text-amber-500 transition-colors">
                          {prop?.title || t.propertyId}
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-white/20 mt-1">
                          Settlement Date: {t.date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-serif text-xl font-bold text-amber-500 mb-1">
                        {formatIndianPrice(t.amount)}
                      </div>
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${
                        t.status === "completed" 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
              <FileText className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-serif italic text-lg">No acquisition history found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}