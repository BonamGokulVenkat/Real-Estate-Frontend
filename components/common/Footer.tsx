"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  quickLinks: [
    { label: "Just For You", path: "/just-for-you" },
    { label: "Find Agencies", path: "/agencies" },
    { label: "Sell Property", path: "/sell" },
    { label: "Our Portfolio", path: "/portfolio" },
  ],
  propertyTypes: [
    "Luxury Villas",
    "Penthouse Suites",
    "Modern Apartments",
    "Townhouses",
    "Private Estates",
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#0A192F] text-white overflow-hidden">
      {/* ── Visual Accents ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* ── Brand Column ── */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center transition-transform group-hover:rotate-12">
                <span className="text-[#0A192F] font-bold text-lg">L</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Luxora <span className="text-amber-500">Estates</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-8">
              Redefining luxury real estate with a curated collection of newly built premium properties. Experience elegance in every square foot.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <button 
                  key={i} 
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#0A192F] hover:border-amber-500 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    href={link.path} 
                    className="text-sm text-white/40 hover:text-amber-400 transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-0 h-3 mr-0 opacity-0 group-hover:w-3 group-hover:mr-2 group-hover:opacity-100 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Properties ── */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg font-semibold mb-6 text-white">Collection</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.propertyTypes.map((type) => (
                <li key={type} className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
                  {type}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter / Contact ── */}
          <div className="lg:col-span-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h4 className="font-serif text-lg font-semibold mb-2">Subscribe</h4>
              <p className="text-xs text-white/40 mb-4">Get the latest luxury listings directly to your inbox.</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email" 
                  className="bg-white/5 border-white/10 focus-visible:ring-amber-500/50 text-white"
                />
                <Button className="bg-amber-500 hover:bg-amber-400 text-[#0A192F] px-4">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  Hyderabad, Telangana, India
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-500" />
                  </div>
                  concierge@luxoraestates.com
                </div>
              </div>
            </div>
          </div>

        </div>

        <Separator className="bg-white/5 mt-16 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
          <p>© 2026 Luxora Estates. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}