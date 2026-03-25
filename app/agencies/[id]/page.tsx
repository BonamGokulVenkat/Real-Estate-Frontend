"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Tag,
  Loader2,
  AlertCircle,
  PackageOpen,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface PropertyMedia {
  media_id: string;
  url: string;
  media_type: string;
}

interface Property {
  property_id: string;
  title: string;
  description: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  price: number;
  status: string;
  date_added: string;
  location: { address: string; city: string; state: string };
  media: PropertyMedia[];
}

interface Builder {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  date_joined: string;
  properties: Property[];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currency } = useCurrency();

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/builders/${id}`);
        if (!res.ok) throw new Error("Agency not found");
        const data: Builder = await res.json();
        setBuilder(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBuilder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading agency profile...</p>
        </div>
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white/60">{error || "Agency not found"}</p>
          <button onClick={() => router.back()} className="text-amber-500 text-sm hover:underline">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const joined = new Date(builder.date_joined).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const initials = builder.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-24 relative z-10">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-amber-500 transition-colors mb-12 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agencies
        </motion.button>

        {/* Builder Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/[0.04] border border-white/10 rounded-[40px] p-10 md:p-14 mb-16 overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center font-serif font-bold text-4xl text-[#0A192F] select-none">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A192F] border border-amber-500/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{builder.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {builder.email && (
                  <span className="flex items-center gap-2 text-white/40 text-sm">
                    <Mail className="w-4 h-4 text-amber-500/70" />
                    {builder.email}
                  </span>
                )}
                {builder.phone && (
                  <span className="flex items-center gap-2 text-white/40 text-sm">
                    <Phone className="w-4 h-4 text-amber-500/70" />
                    {builder.phone}
                  </span>
                )}
                <span className="flex items-center gap-2 text-white/40 text-sm">
                  <CalendarDays className="w-4 h-4 text-amber-500/70" />
                  Member since {joined}
                </span>
              </div>
            </div>

            {/* Listing count */}
            <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-center">
              <p className="text-4xl font-serif font-bold text-amber-500">{builder.properties.length}</p>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Total Listings</p>
            </div>
          </div>
        </motion.div>

        {/* Section heading */}
        <div className="flex items-center gap-4 mb-4">
          <span className="h-[1px] w-8 bg-amber-500/50" />
          <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Portfolio</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12">Properties Listed</h2>

        {/* No listings */}
        {builder.properties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-6 bg-white/[0.02] border border-white/5 rounded-[40px]"
          >
            <PackageOpen className="w-16 h-16 text-white/10" />
            <p className="text-white/30 text-xl font-serif font-light">There are no listings yet!</p>
            <p className="text-white/20 text-sm">Check back soon for upcoming properties by this builder.</p>
          </motion.div>
        )}

        {/* Properties Grid */}
        {builder.properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {builder.properties.map((property, index) => {
              const thumbnail = property.media?.find((m) => m.media_type === "image")?.url;
              const location = property.location
                ? `${property.location.city}, ${property.location.state}`
                : "—";

              return (
                <motion.div
                  key={property.property_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.6 }}
                >
                  <Link href={`/properties/${property.property_id}`} className="group block">
                    <div className="relative bg-white/[0.04] border border-white/10 rounded-[28px] overflow-hidden hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500">

                      {/* Thumbnail */}
                      <div className="relative h-52 bg-white/5 overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-white/10" />
                          </div>
                        )}
                        {/* Status badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          property.status === "available"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : property.status === "sold"
                            ? "bg-red-500/20 text-red-400 border border-red-500/20"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                        }`}>
                          {property.status}
                        </div>
                        {/* Price */}
                        <div className="absolute bottom-4 right-4 bg-[#0A192F]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-amber-400 font-bold text-sm border border-white/5">
                          {formatPrice(property.price, currency)}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-6">
                        <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                          {property.title}
                        </h3>

                        <p className="flex items-center gap-1.5 text-white/40 text-sm mb-4">
                          <MapPin className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                          {location}
                        </p>

                        <div className="flex items-center gap-4 text-white/30 text-xs pt-4 border-t border-white/5">
                          {property.bedrooms != null && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-amber-500/50" />
                              {property.bedrooms} Beds
                            </span>
                          )}
                          {property.bathrooms != null && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5 text-amber-500/50" />
                              {property.bathrooms} Baths
                            </span>
                          )}
                          {property.size_sqft && (
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5 text-amber-500/50" />
                              {property.size_sqft.toLocaleString()} ft²
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-1 capitalize">
                            <Tag className="w-3.5 h-3.5 text-amber-500/50" />
                            {property.property_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}