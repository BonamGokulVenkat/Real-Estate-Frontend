// app/edit-property/[id]/page.tsx
"use client";

import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { Upload, Home, User, Sparkles, IndianRupee, Ruler, Bed, Bath, Loader2, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { propertyService, Property, PropertyType } from "@/services/propertyService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useParams } from "next/navigation";
import TagInput from "@/components/common/ui/TagInputProps";
import { useCurrency } from "@/hooks/useCurrency";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface EditFormData {
  title: string;
  description: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqft?: number;
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  features: string[];
}

export default function EditProperty() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice, currency, setCurrency } = useCurrency();

  // Fetch property data
  const { data: property, refetch } = useQuery<Property>({
    queryKey: ["property", propertyId],
    queryFn: () => propertyService.getById(propertyId),
    enabled: !!propertyId,
  });

  // Check authorization and load property
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (property) {
      // Check if user owns this property
      if (property.builder?.user_id !== user?.user_id && user?.role !== "admin") {
        toast.error("You don't have permission to edit this property");
        router.push("/profile");
        return;
      }
      
      // Check if property can be edited
      if (property.status === "edit_pending") {
        toast.error("This property already has a pending edit request");
        router.push("/profile");
        return;
      }
      
      if (property.status === "delete_pending") {
        toast.error("This property is pending deletion and cannot be edited");
        router.push("/profile");
        return;
      }
      
      setIsLoading(false);
    }
  }, [property, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>();

  // Reset form when property loads
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size_sqft: property.size_sqft,
        price: property.price,
        address: property.location?.address || "",
        city: property.location?.city || "",
        state: property.location?.state || "",
        zipCode: property.location?.zipCode?.toString() || "",
        features: property.features || [],
      });
      setExistingMedia(property.media || []);
    }
  }, [property, reset]);

  const geocodeAddress = async (
    address: string,
    city: string,
    state: string,
    zipCode: string
  ) => {
    const queries = [
      `${address}, ${city}, ${state}, ${zipCode}`,
      `${address}, ${city}, ${state}`,
      `${address}, ${city}`,
      `${city}, ${state}, ${zipCode}`,
      `${city}, ${state}`,
      state,
    ];

    for (const query of queries) {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          query
        )}&limit=1&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      );
      if (!response.ok) {
        continue;
      }
      const result = await response.json();

      if (result.features?.length > 0) {
        const location = result.features[0];
        return {
          lat: location.properties.lat,
          lng: location.properties.lon,
          confidence:
            query === `${address}, ${city}, ${state}, ${zipCode}`
              ? "HIGH"
              : query === `${address}, ${city}, ${state}`
              ? "MEDIUM"
              : "LOW",
        };
      }
    }
    return null;
  };

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

  const removeExistingMedia = (mediaId: string) => {
    setMediaToDelete((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m.media_id !== mediaId));
  };

  const normalizeFile = (file: File): File => {
    if (file.name.toLowerCase().endsWith('.jfif')) {
      return new File([file], file.name.replace(/\.jfif$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    }
    return file;
  };

  const onSubmit = async (data: EditFormData) => {
    if (!user || !property) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting edit request...");

    try {
      // Upload new media
      const uploadedMedia = [];
      for (const [index, rawFile] of files.entries()) {
        const file = normalizeFile(rawFile);
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.user_id}/${fileName}`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("filePath", filePath);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(`Failed to upload ${file.name}: ${error}`);
        }

        const { publicUrl } = await res.json();

        uploadedMedia.push({
          media_type: file.type.startsWith("video/") ? "video" : "image",
          room_type: "other",
          url: publicUrl,
          thumbnail_url: publicUrl,
          display_order: existingMedia.length + index,
        });
      }

      // Get coordinates
      const coordinates = await geocodeAddress(data.address, data.city, data.state, data.zipCode);
      if (!coordinates) {
        toast.error("Unable to locate property. Please verify the address.", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // Prepare edit payload
      const editPayload = {
        title: data.title,
        description: data.description,
        property_type: data.property_type.toLowerCase() as PropertyType,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        size_sqft: data.size_sqft ? Number(data.size_sqft) : undefined,
        price: data.price,
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: Number(data.zipCode),
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        features: data.features,
        media: [...existingMedia, ...uploadedMedia],
        mediaToDelete: mediaToDelete,
      };

      // Submit edit request
      await propertyService.requestEdit(propertyId, editPayload);

      toast.success("Edit request submitted for admin approval!", { id: toastId });
      router.push("/profile");

    } catch (error: any) {
      console.error("EDIT ERROR:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to submit edit request.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-[#0A192F]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[#0A192F]">
        <p className="text-white/60 mb-4">Property not found</p>
        <Link href="/profile">
          <Button className="bg-amber-500 hover:bg-amber-400 text-[#0A192F]">
            Back to Profile
          </Button>
        </Link>
      </div>
    );
  }

  const currentPrice = watch("price");
  const numericPrice = Number(currentPrice);
  const isNumericPrice = currentPrice?.trim() !== "" && !isNaN(numericPrice) && isFinite(numericPrice) && numericPrice > 0;

  const sectionHeading = "font-serif text-xl font-bold text-white mb-8 flex items-center gap-3 italic";
  const inputStyle = "bg-white/[0.03] border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 text-white placeholder:text-white/20 h-12";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block";

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
        {/* Back Button */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-white/40 hover:text-amber-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Profile</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              Edit Listing
            </span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tighter">
            Edit <span className="text-white/40 italic font-light">Property</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-lg font-light leading-relaxed">
            Your changes will be reviewed by an admin before going live.
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
                <Input 
                  {...register("title", { required: "Title is required" })} 
                  className={`${inputStyle} ${errors.title ? "border-red-500/50" : ""}`} 
                  placeholder="The Glass Pavilion, Worli" 
                />
                {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Description</label>
                <textarea 
                  {...register("description", { required: "Description is required" })} 
                  className={`${inputStyle} w-full p-4 min-h-[120px] resize-y ${errors.description ? "border-red-500/50" : ""}`} 
                  placeholder="Describe the details of your property..." 
                />
                {errors.description && <p className="text-red-400 text-[10px] mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className={labelStyle}>Property Type</label>
                  <select {...register("property_type")} className={`${inputStyle} w-full px-3 appearance-none`}>
                    <option value="villa" className="bg-[#0D2137]">Villa</option>
                    <option value="penthouse" className="bg-[#0D2137]">Penthouse</option>
                    <option value="mansion" className="bg-[#0D2137]">Mansion</option>
                    <option value="apartment" className="bg-[#0D2137]">Apartment</option>
                    <option value="townhouse" className="bg-[#0D2137]">Townhouse</option>
                    <option value="house" className="bg-[#0D2137]">House</option>
                    <option value="land" className="bg-[#0D2137]">Land</option>
                    <option value="commercial" className="bg-[#0D2137]">Commercial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Asking Price (in INR)</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                    <div className="space-y-2 w-18">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className={`${inputStyle} w-full px-3 appearance-none`}
                      >
                        <option value="INR" className="bg-[#0D2137]">₹ INR</option>
                        <option value="USD" className="bg-[#0D2137]">$ USD</option>
                        <option value="EUR" className="bg-[#0D2137]">€ EUR</option>
                        <option value="GBP" className="bg-[#0D2137]">£ GBP</option>
                        <option value="AED" className="bg-[#0D2137]">AED</option>
                      </select>
                    </div>
                    <div className="space-y-1 w-58">
                      <Input 
                        {...register("price", { required: "Price is required" })} 
                        type="text" 
                        className={`${inputStyle} pl-12`} 
                        placeholder="120000000 or Price on Request" 
                      />
                    </div>
                  </div>
                  {isNumericPrice && (
                    <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                      <span className="text-amber-500 text-xs mt-2">
                        Estimated: {formatPrice(numericPrice)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelStyle}>Beds</label>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      {...register("bedrooms", { required: "Required", valueAsNumber: true })} 
                      type="number" 
                      className={`${inputStyle} pl-12`} 
                      placeholder="4" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Baths</label>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      {...register("bathrooms", { required: "Required", valueAsNumber: true })} 
                      type="number" 
                      className={`${inputStyle} pl-12`} 
                      placeholder="5" 
                    />
                  </div>
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className={labelStyle}>Sqft</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      {...register("size_sqft", { valueAsNumber: true })} 
                      type="number" 
                      className={`${inputStyle} pl-12`} 
                      placeholder="6500" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-1">
                  <label className={labelStyle}>Street Address</label>
                  <Input
                    {...register("address", { required: "Street Address is required" })}
                    className={inputStyle}
                    placeholder="Flat No 101, Tridasa Apartments, MG Road"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <label className={labelStyle}>City</label>
                    <Input 
                      {...register("city", { required: "City is required" })} 
                      className={inputStyle} 
                      placeholder="Mumbai" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>State</label>
                    <Input 
                      {...register("state", { required: "State is required" })} 
                      className={inputStyle} 
                      placeholder="Maharashtra" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>Zip Code</label>
                    <Input 
                      {...register("zipCode", { required: "Zip Code is required" })} 
                      className={inputStyle} 
                      placeholder="400050" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Features & Amenities</label>
                  <p className="text-white/20 text-[10px] mb-3">Add amenities and features (press Enter to add)</p>
                  <Controller
                    name="features"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-white/5" />

          {/* Section 2: Existing Media */}
          {existingMedia.length > 0 && (
            <section>
              <h2 className={sectionHeading}>
                <Upload className="w-5 h-5 text-amber-500" /> Current Media
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingMedia.map((media, i) => (
                  <div key={media.media_id} className="relative rounded-xl overflow-hidden aspect-square border border-white/10 group bg-white/5">
                    <img
                      src={media.url}
                      alt={`Property media ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(media.media_id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: New Media Upload */}
          <section>
            <h2 className={sectionHeading}>
              <Upload className="w-5 h-5 text-amber-500" /> Add New Media
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
              <p className="text-white font-serif text-lg italic group-hover:text-white transition-colors">Click to upload additional photos</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-3">High-resolution JPEG's and Videos MAX 30 MB</p>
            </div>

            {files.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-white/10 group bg-white/5">
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
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Edit Request...
              </span>
            ) : "Submit Edit for Approval"}
          </Button>
        </motion.form>

        <div className="mt-16 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Your property will be hidden until the edit is approved
          </p>
        </div>
      </div>
    </div>
  );
}