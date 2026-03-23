"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Upload, Home, User, Sparkles, IndianRupee, Ruler, Bed, Bath, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { propertyService, PropertyStatus, PropertyType } from "@/services/propertyService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

interface SellForm {
  title: string;
  description: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  price: number;
  address: string;
  city: string;
  state: string;
}

export default function Sell() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SellForm>();

  const currentPrice = watch("price");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 15) {
        toast.error("You can upload a maximum of 15 images.");
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellForm) => {
    if (!user) {
      toast.error("You must be logged in to create a listing.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please upload at least one image of the property.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Uploading media assets...");

    try {
      const uploadedMedia = [];

      for (const [index, file] of files.entries()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.user_id || crypto.randomUUID()}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        uploadedMedia.push({
          media_type: file.type.startsWith('video/') ? 'video' : 'image',
          room_type: 'other',
          url: publicUrl,
          thumbnail_url: publicUrl,
          display_order: index,
        });
      }

      toast.loading("Publishing property details...", { id: toastId });

      const payload = {
        title: data.title,
        description: data.description || "A luxury estate.",
        property_type: data.type.toLowerCase() as PropertyType,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        size_sqft: Number(data.size),
        price: Number(data.price),
        location: {
          address: data.address || "TBA",
          city: data.city || "Mumbai",
          state: data.state || "MH",
          lat: 19.0760, // Dummy coords
          lng: 72.8777,
        },
        features: ["Premium Finish", "High Ceilings"],
        status: "available" as PropertyStatus,
        media: uploadedMedia,
        builder: { user_id: user.id }
      };

      const property = await propertyService.create(payload as any);
      
      toast.success("Estate listed successfully!", { id: toastId });
      reset();
      setFiles([]);
      router.push(`/property/${property.property_id}`);

    } catch (error: any) {
      toast.error(error.message || "Failed to list property.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionHeading = "font-serif text-xl font-bold text-white mb-8 flex items-center gap-3 italic";
  const inputStyle = "bg-white/[0.03] border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 text-white placeholder:text-white/20 h-12";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block";

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
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
          {/* Section 1: Property Details */}
          <section>
            <h2 className={sectionHeading}>
              <Home className="w-5 h-5 text-amber-500" /> Estate Specifications
            </h2>
            <div className="space-y-8">
              <div className="space-y-1">
                <label className={labelStyle}>Listing Title</label>
                <Input {...register("title", { required: "Title is required" })} className={inputStyle} placeholder="The Glass Pavilion, Worli" />
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Description</label>
                <textarea {...register("description", { required: "Description is required" })} className={`${inputStyle} w-full p-4 min-h-[120px] resize-y`} placeholder="Describe the details of your property..." />
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelStyle}>Beds</label>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("bedrooms", { required: "Required" })} type="number" className={`${inputStyle} pl-12`} placeholder="4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Baths</label>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("bathrooms", { required: "Required" })} type="number" className={`${inputStyle} pl-12`} placeholder="5" />
                  </div>
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className={labelStyle}>Sqft</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input {...register("size", { required: "Required" })} type="number" className={`${inputStyle} pl-12`} placeholder="6500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className={labelStyle}>City</label>
                  <Input {...register("city", { required: "City is required" })} className={inputStyle} placeholder="Mumbai" />
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>State / Region</label>
                  <Input {...register("state", { required: "State is required" })} className={inputStyle} placeholder="Maharashtra" />
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-white/5" />

          {/* Section 2: Media */}
          <section>
            <h2 className={sectionHeading}>
              <Upload className="w-5 h-5 text-amber-500" /> Cinematic Assets
            </h2>
            
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-white/10 rounded-[32px] p-16 text-center hover:border-amber-500/50 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="w-12 h-12 text-white/20 mx-auto mb-6 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-500" />
              <p className="text-white font-serif text-lg italic group-hover:text-white transition-colors">Click to upload architectural photography</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-3">High-resolution JPEG or PNG MAX 15</p>
            </div>

            {files.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-white/10 group bg-white/5">
                    {/* Simplified preview to avoid creating object URLs, just shows filename */}
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center break-all">
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest line-clamp-2">{file.name}</p>
                      <p className="text-[9px] text-white/40 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-amber-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Committing to Ledger...
              </span>
            ) : "Submit to Luxora Board"}
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