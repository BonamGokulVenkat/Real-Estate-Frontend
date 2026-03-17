"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft,
  ShieldCheck,
  Award,
  Users,
  TrendingUp,
  Quote,
  CheckCircle2,
  CalendarDays,
  Sparkles
} from "lucide-react";

import { agencies, properties } from "@/data/dummyData";
import PropertyCard from "@/components/common/PropertyCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AgencyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const agency = agencies.find((a) => a.id === id);
  const agencyProperties = properties.filter((p) => p.agencyId === id);

  if (!agency) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-[#0A192F] text-white">
        <p className="text-white/40 font-serif text-xl italic">Agency not found.</p>
        <Button asChild variant="link" className="text-amber-500 mt-4">
          <Link href="/agencies">Return to Network</Link>
        </Button>
      </div>
    );
  }

  const team = [
    { name: "Julian Vance", role: "Managing Director", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" },
    { name: "Elena Rossi", role: "Senior Partner", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
    { name: "Marcus Thorne", role: "Luxury Specialist", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Lighting */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Navigation */}
        <Link href="/agencies" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-amber-500 mb-12 transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Network
        </Link>

        {/* --- HERO HEADER --- */}
        <div className="relative bg-white/[0.03] backdrop-blur-3xl rounded-[48px] border border-white/10 p-8 md:p-16 overflow-hidden mb-20 shadow-2xl">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            {/* Agency Logo/Initial */}
            <div className="w-40 h-40 md:w-56 md:h-56 bg-[#0D2137] rounded-[32px] flex items-center justify-center text-white text-7xl font-serif font-bold shadow-2xl border border-white/10">
              {agency.name[0]}
            </div>

            <div className="flex-grow text-center lg:text-left space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em]">Luxora Certified Partner</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter leading-none">{agency.name}</h1>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6">
                 <p className="flex items-center gap-2 text-white/40 text-lg font-light italic font-serif">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  {typeof agency.location === 'object' ? `${agency.location.city}, ${agency.location.country}` : agency.location}
                </p>
                <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 px-3 py-1 rounded-full bg-amber-500/5">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {agency.rating} Rating
                </div>
              </div>

              {/* Contact Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                {[
                  { icon: Phone, label: "+1 (555) LUX-0900" },
                  { icon: Mail, label: "private@luxora.com" },
                  { icon: Globe, label: "luxoraestates.com" }
                ].map((item, i) => (
                  <button key={i} className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl transition-all border border-white/5 group">
                    <item.icon className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* About Section */}
            <section className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-3xl font-bold italic text-white/80 tracking-tight">Redefining Luxury Standards</h2>
                <div className="w-20 h-px bg-amber-500/50" />
              </div>
              <div className="max-w-3xl space-y-8">
                <p className="text-white/50 text-xl font-light leading-relaxed">
                  {agency.description || "The unyielding commitment to excellence in the high-end residential market defines our legacy."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "Over $2.5B in career sales",
                    "Exclusive off-market access",
                    "Bespoke global marketing",
                    "In-house legal advisory"
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-4 text-white/70 text-sm font-light">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-amber-500" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Meet the Team */}
            <section className="space-y-12">
              <h2 className="font-serif text-3xl font-bold italic text-white/80">Leadership Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {team.map((member) => (
                  <div key={member.name} className="group space-y-4">
                    <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden border border-white/10 transition-transform duration-500 group-hover:-translate-y-2">
                      <Image src={member.img} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent opacity-60" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white tracking-tight">{member.name}</h4>
                      <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Listings */}
            <section className="space-y-12">
              <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <h2 className="font-serif text-3xl font-bold italic text-white/80 tracking-tight">Current Portfolio</h2>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">{agencyProperties.length} Exclusive Assets</div>
              </div>
              
              {agencyProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {agencyProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/[0.02] rounded-[40px] p-24 text-center border border-dashed border-white/10">
                  <Building2 className="w-12 h-12 text-white/10 mx-auto mb-6" />
                  <p className="text-white/40 font-serif text-lg italic tracking-wide">Private listings available by invitation only.</p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: STATS & ACTIONS */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              
              {/* Performance Stats Bento */}
              <div className="bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[48px] border border-white/10 shadow-2xl space-y-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Agency Insights</h3>
                <div className="space-y-10">
                  {[
                    { icon: TrendingUp, val: agency.totalProperties, label: "Active Estates" },
                    { icon: Users, val: "12,400+", label: "Global Clients" },
                    { icon: CalendarDays, val: "14 Years", label: "Experience" }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-amber-500/40 transition-all duration-500 shadow-xl">
                        <stat.icon className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-serif font-bold text-white tracking-tight">{stat.val}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/5" />
                
                <Button className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-amber-500/10">
                  Arrange Private Consultation
                </Button>
              </div>

              {/* Verified Badge */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-[32px] p-8 flex items-center gap-6 group">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12">
                   <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">Certified Agency</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed mt-1">Verified for high-volume transactions by the Luxora Board.</p>
                </div>
              </div>

              {/* Testimonial Snippet */}
              <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/10 italic relative overflow-hidden">
                <Quote className="w-16 h-16 text-amber-500/5 absolute -top-4 -left-4" />
                <p className="text-white/50 text-sm leading-relaxed relative z-10 font-light">
                  &quot;The most professional team I&apos;ve worked with. They handled our off-market acquisition with absolute discretion and speed.&quot;
                </p>
                <div className="mt-6 text-[9px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">— Private Family Office</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}