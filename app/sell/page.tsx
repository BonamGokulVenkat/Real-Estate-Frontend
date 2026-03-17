"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Upload, Home, MapPin, User, Sparkles, IndianRupee, Ruler, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface SellForm {
  sellerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  price: number;
  city: string;
  state: string;
}

export default function Sell() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellForm>();

  const currentPrice = watch("price");

  const onSubmit = (data: SellForm) => {
    console.log("Property listing submitted:", data);
    alert("Property submitted to the Luxora board for review.");
  };

  const sectionHeading = 
    "font-serif text-xl font-bold text-white mb-8 flex items-center gap-3 italic";

  const inputStyle = "bg-white/[0.03] border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 text-white placeholder:text-white/20 h-12";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block";

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              Private Listing
            </span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter">
            Sell Your <span className="text-white/40 italic font-light">Estate</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-lg font-light leading-relaxed">
            Connect with a global network of premium buyers. List your architectural masterpiece on the Luxora standard.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 space-y-16 shadow-2xl"
        >
          {/* Section 1: Seller Information */}
          <section>
            <h2 className={sectionHeading}>
              <User className="w-5 h-5 text-amber-500" /> Seller Narrative
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className={labelStyle}>Full Name</label>
                <Input {...register("sellerName", { required: "Name is required" })} className={inputStyle} placeholder="E.g. Alexander Knight" />
                {errors.sellerName && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.sellerName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelStyle}>Direct Email</label>
                <Input {...register("email", { required: "Email is required" })} type="email" className={inputStyle} placeholder="alex@estate.com" />
                {errors.email && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </section>

          <Separator className="bg-white/5" />

          {/* Section 2: Property Details */}
          <section>
            <h2 className={sectionHeading}>
              <Home className="w-5 h-5 text-amber-500" /> Estate Specifications
            </h2>
            <div className="space-y-8">
              <div className="space-y-1">
                <label className={labelStyle}>Listing Title</label>
                <Input {...register("title", { required: "Title is required" })} className={inputStyle} placeholder="The Glass Pavilion, Worli" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className={labelStyle}>Property Type</label>
                  <select {...register("type")} className={`${inputStyle} w-full px-3 appearance-none`}>
                    <option value="Villa" className="bg-[#0D2137]">Villa</option>
                    <option value="Penthouse" className="bg-[#0D2137]">Penthouse</option>
                    <option value="Mansion" className="bg-[#0D2137]">Mansion</option>
                    <option value="Apartment" className="bg-[#0D2137]">Apartment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Asking Price (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                    <Input {...register("price", { required: "Price is required" })} type="number" className={`${inputStyle} pl-12`} placeholder="120000000" />
                  </div>
                  {currentPrice > 0 && (
                    <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                      Estimate: {currentPrice >= 10000000 ? `${(currentPrice / 10000000).toFixed(2)} Cr` : `${(currentPrice / 100000).toFixed(2)} Lakh`}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelStyle}>Beds</label>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("bedrooms")} type="number" className={`${inputStyle} pl-12`} placeholder="4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Baths</label>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("bathrooms")} type="number" className={`${inputStyle} pl-12`} placeholder="5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Sqft</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("size")} type="number" className={`${inputStyle} pl-12`} placeholder="6500" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-white/5" />

          {/* Section 3: Media */}
          <section>
            <h2 className={sectionHeading}>
              <Upload className="w-5 h-5 text-amber-500" /> Cinematic Assets
            </h2>
            <div className="group border-2 border-dashed border-white/10 rounded-[32px] p-16 text-center hover:border-amber-500/50 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="w-12 h-12 text-white/20 mx-auto mb-6 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-500" />
              <p className="text-white font-serif text-lg italic group-hover:text-white transition-colors">Click to upload architectural photography</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-3">High-resolution JPEG or PNG (Max 15)</p>
            </div>
          </section>

          <Button
            type="submit"
            className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-amber-500/10 transition-all active:scale-[0.98]"
          >
            Submit to Luxora Board
          </Button>
        </motion.form>

        <div className="mt-16 text-center">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                All listings undergo a 48-hour curation review
            </p>
        </div>
      </div>
    </div>
  );
}