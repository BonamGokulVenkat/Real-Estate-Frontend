"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Upload, Home, Sparkles, Bed, Bath, Ruler, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Require from "@/components/common/required";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { propertyService, PropertyStatus, PropertyType } from "@/services/propertyService";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import TagInput from "@/components/common/ui/TagInputProps";
import { useCurrency } from "@/hooks/useCurrency";
import { Controller } from "react-hook-form";

interface SellForm {
  title: string;
  description: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  price: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode: string;
  features: string[];
}

// Extend Window to include google
declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

export default function Sell() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { formatPrice, currency, setCurrency, rates } = useCurrency();

  const convertToINR = (amount: number): number => {
    const rate = rates[currency] ?? 1;
    if (!rate || rate === 0) return amount;
    return Number((amount / rate).toFixed(2));
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const geocodeAddress = async (
    address: string,
    city: string,
    state: string,
    country: string,
    zipCode: string
  ) => {
    const queries = [
      `${address}, ${city}, ${state}, ${country}, ${zipCode}`,
      `${address}, ${city}, ${state}, ${country}`,
      `${address}, ${city}`,
      `${city}, ${state}, ${zipCode}`,
      `${city}, ${state}`,
      country ? `${city}, ${country}` : `${city}`,
    ];

    for (const query of queries) {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=1&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      );
      if (!response.ok) continue;
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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SellForm>();

  // ─── Google Places Autocomplete ───────────────────────────────────────────

  const initAutocomplete = useCallback(() => {
    if (!addressInputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      { types: ["address"] }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.address_components) return;

      // Helpers to extract components
      const get = (type: string) =>
        place.address_components!.find((c) => c.types.includes(type))?.long_name ?? "";
      const getShort = (type: string) =>
        place.address_components!.find((c) => c.types.includes(type))?.short_name ?? "";

      // Build street address: street_number + route
      const streetNumber = get("street_number");
      const route = get("route");
      const streetAddress = [streetNumber, route].filter(Boolean).join(" ");

      // Resolve city from multiple possible component types
      const city =
        get("locality") ||
        get("sublocality_level_1") ||
        get("sublocality") ||
        get("postal_town") ||
        get("administrative_area_level_2");

      const state = get("administrative_area_level_1");
      const country = get("country");
      const zipCode = get("postal_code");

      // Update form fields
      if (streetAddress) setValue("address", streetAddress, { shouldValidate: true });
      if (city) setValue("city", city, { shouldValidate: true });
      if (state) setValue("state", state, { shouldValidate: true });
      if (country) setValue("country", country, { shouldValidate: true });
      if (zipCode) setValue("zipCode", zipCode, { shouldValidate: true });
    });
  }, [setValue]);

  useEffect(() => {
    // If already loaded, init immediately
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Avoid double-loading the script
    if (document.getElementById("google-maps-script")) {
      // Script tag exists but not loaded yet — wait for callback
      window.initGooglePlaces = initAutocomplete;
      return;
    }

    // Inject the script
    window.initGooglePlaces = initAutocomplete;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup listener on unmount
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initAutocomplete]);

  // Merge react-hook-form ref with our local ref
  const { ref: rhfAddressRef, ...addressRegisterProps } = register("address", {
    required: "Street Address is required",
  });

  // ─── Auth / Role guard ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isHydrated) return; // wait for localStorage rehydration before checking auth
    if (!isAuthenticated) {
      toast.error("Please login to list properties.");
      router.replace("/login");
    } else if (user?.role !== "builder") {
      toast.error("Only registered builders can list properties.");
      router.replace("/");
    } else if (
      user?.plan === "FREE" &&
      (user.propertiesPosted || 0) >= (user.propertyLimit ?? 1)
    ) {
      toast.error("Property limit reached. Please upgrade to continue.");
      router.push("/subscription");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // While the store is rehydrating from localStorage, show nothing (avoids flash-redirect)
  if (!isHydrated) return null;

  if (!isAuthenticated || user?.role !== "builder") return null;

  const currentPrice = watch("price");
  const numericPrice = Number(currentPrice);
  const isNumericPrice =
    currentPrice?.trim() !== "" &&
    !isNaN(numericPrice) &&
    isFinite(numericPrice) &&
    numericPrice > 0;

  const normalizeFile = (file: File): File => {
    if (file.name.toLowerCase().endsWith(".jfif")) {
      return new File([file], file.name.replace(/\.jfif$/i, ".jpg"), {
        type: "image/jpeg",
      });
    }
    return file;
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
    setUploadProgress(0);

    try {
      const uploadedMedia = [];

      for (const [index, rawFile] of files.entries()) {
        const file = normalizeFile(rawFile);
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `properties/${user.user_id}/${fileName}`;

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
          display_order: index,
        });

        setUploadProgress(((index + 1) / files.length) * 50);
      }

      const coordinates = await geocodeAddress(
        data.address,
        data.city,
        data.state || "",
        data.country,
        data.zipCode
      );
      if (!coordinates) {
        toast.error("Unable to locate property. Please verify the address.", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      setUploadProgress(75);
      toast.loading("Publishing property details...", { id: toastId });

      const priceInSelectedCurrency = Number(data.price);
      const priceInINR =
        !isNaN(priceInSelectedCurrency) && isFinite(priceInSelectedCurrency)
          ? convertToINR(priceInSelectedCurrency)
          : data.price;

      const payload = {
        title: data.title,
        description: data.description || "A luxury estate.",
        property_type: data.type.toLowerCase() as PropertyType,
        listing_type: "sale",
        bedrooms: Number(data.bedrooms) || 0,
        bathrooms: Number(data.bathrooms) || 0,
        size_sqft: data.size ? Number(data.size) : undefined,
        price: String(priceInINR),
        location: {
          address: data.address,
          city: data.city,
          state: data.state || "",
          country: data.country,
          zipCode: Number(data.zipCode) || 0,
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        features: data.features || [],
        status: "pending" as PropertyStatus,
        media: uploadedMedia,
        builder: { user_id: user.user_id },
      };

      const property = await propertyService.create(payload);

      setUploadProgress(100);
      toast.success("Property submitted for admin approval!", { id: toastId });

      if (user) {
        useAuthStore.getState().updateUser({
          propertiesPosted: (user.propertiesPosted || 0) + 1,
        });
      }

      reset();
      setFiles([]);
      router.push("/profile");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to list property.";

      toast.error(errorMessage, { id: toastId });

      if (error.response?.status === 409 || errorMessage.includes("LIMIT_REACHED")) {
        setTimeout(() => router.push("/subscription"), 2000);
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const sectionHeading =
    "font-serif text-xl font-bold text-white mb-8 flex items-center gap-3 italic";
  const inputStyle =
    "bg-white/[0.03] border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 text-white placeholder:text-white/20 h-12";
  const labelStyle =
    "text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block";

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
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em]">
              Private Listing
            </span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter">
            Sell Your{" "}
            <span className="text-white/40 italic font-light">Estate</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-lg font-light leading-relaxed">
            Connect with a global network of premium buyers. List your
            architectural masterpiece on the Luxora standard.
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
                <div className="flex gap-2 items-center">
                  <label className={labelStyle}>Listing Title</label> <Require />
                </div>
                <Input
                  {...register("title", { required: "Title is required" })}
                  className={`${inputStyle} ${errors.title ? "border-red-500/50" : ""}`}
                  placeholder="The Glass Pavilion, Worli"
                />
                {errors.title && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <label className={labelStyle}>Description</label> <Require />
                </div>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  className={`${inputStyle} w-full p-4 min-h-[120px] resize-y ${errors.description ? "border-red-500/50" : ""}`}
                  placeholder="Describe the details of your property..."
                />
                {errors.description && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Property Type</label> <Require />
                  </div>
                  <select
                    {...register("type", { required: "Property type is required" })}
                    className={`${inputStyle} w-full px-3 appearance-none`}
                  >
                    <option value="">Select Type</option>
                    <option value="villa" className="bg-[#0D2137]">Villa</option>
                    <option value="penthouse" className="bg-[#0D2137]">Penthouse</option>
                    <option value="mansion" className="bg-[#0D2137]">Mansion</option>
                    <option value="apartment" className="bg-[#0D2137]">Apartment</option>
                    <option value="townhouse" className="bg-[#0D2137]">Townhouse</option>
                    <option value="house" className="bg-[#0D2137]">House</option>
                    <option value="land" className="bg-[#0D2137]">Land</option>
                    <option value="commercial" className="bg-[#0D2137]">Commercial</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Asking Price</label> <Require />
                  </div>
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
                    <div className="col-span-3">
                      <Input
                        {...register("price", { required: "Price is required" })}
                        type="text"
                        className={inputStyle}
                        placeholder="e.g., 120000000 or On Request"
                      />
                    </div>
                  </div>
                  {errors.price && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.price.message}</p>
                  )}
                  {isNumericPrice && (
                    <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                      ≈ {formatPrice(convertToINR(numericPrice))} · value in INR: ₹
                      {Math.round(convertToINR(numericPrice)).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Bedrooms</label> <Require />
                  </div>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      {...register("bedrooms", {
                        required: "Number of bedrooms is required",
                        valueAsNumber: true,
                      })}
                      type="number"
                      className={`${inputStyle} pl-12`}
                      placeholder="4"
                    />
                    {errors.bedrooms && (
                      <p className="text-red-400 text-[10px] mt-1">{errors.bedrooms.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Bathrooms</label> <Require />
                  </div>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      {...register("bathrooms", {
                        required: "Number of bathrooms is required",
                        valueAsNumber: true,
                      })}
                      type="number"
                      className={`${inputStyle} pl-12`}
                      placeholder="5"
                    />
                    {errors.bathrooms && (
                      <p className="text-red-400 text-[10px] mt-1">{errors.bathrooms.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Area (Sq.Ft)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      {...register("size", { valueAsNumber: true })}
                      type="number"
                      className={`${inputStyle} pl-12`}
                      placeholder="6500"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Address Section ──────────────────────────────────────────── */}
              <div className="space-y-8">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Street Address</label> <Require />
                  </div>
                  {/* 
                    We split the RHF ref and the DOM ref so that:
                    - react-hook-form tracks value/validation via rhfAddressRef
                    - Google Places targets the actual DOM node via addressInputRef
                  */}
                  <Input
                    {...addressRegisterProps}
                    ref={(el) => {
                      rhfAddressRef(el);
                      addressInputRef.current = el;
                    }}
                    className={`${inputStyle} ${errors.address ? "border-red-500/50" : ""}`}
                    placeholder="Start typing your address..."
                    autoComplete="off"
                  />
                  {errors.address && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.address.message}</p>
                  )}
                  <p className="text-white/20 text-[10px] mt-1">
                    Powered by Google Places — city, state, country & zip will fill automatically
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <label className={labelStyle}>City</label> <Require />
                    </div>
                    <Input
                      {...register("city", { required: "City is required" })}
                      className={inputStyle}
                      placeholder="Mumbai"
                    />
                    {errors.city && (
                      <p className="text-red-400 text-[10px] mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>State</label>
                    <Input
                      {...register("state")}
                      className={inputStyle}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <label className={labelStyle}>Country</label> <Require />
                    </div>
                    <Input
                      {...register("country", { required: "Country is required" })}
                      className={inputStyle}
                      placeholder="India"
                    />
                    {errors.country && (
                      <p className="text-red-400 text-[10px] mt-1">{errors.country.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <label className={labelStyle}>Zip Code</label> <Require />
                    </div>
                    <Input
                      {...register("zipCode", { required: "Zip Code is required" })}
                      className={inputStyle}
                      placeholder="400050"
                    />
                    {errors.zipCode && (
                      <p className="text-red-400 text-[10px] mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <label className={labelStyle}>Features & Amenities</label> <Require />
                  </div>
                  <p className="text-white/20 text-[10px] mb-3">
                    Add amenities and features (press Enter to add)
                  </p>
                  <Controller
                    name="features"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <TagInput value={field.value || []} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-white/5" />

          {/* Section 2: Media Upload */}
          <section>
            <h2 className={sectionHeading}>
              <div className="flex gap-2 items-center">
                <Upload className="w-5 h-5 text-amber-500" /> Cinematic Assets <Require />
              </div>
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
              <p className="text-white font-serif text-lg italic group-hover:text-white transition-colors">
                Click to upload architectural photography
              </p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-3">
                High-resolution JPEGs and Videos (Max 30 MB each)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {files.length} file(s) selected
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden aspect-square border border-white/10 group bg-white/5"
                    >
                      <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest line-clamp-2">
                          {file.name}
                        </p>
                        <p className="text-[9px] text-white/40 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
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
              </div>
            )}

            {isSubmitting && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-white/30 text-[10px] text-center mt-2">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
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
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting for Approval...
              </span>
            ) : (
              "Submit for Admin Approval"
            )}
          </Button>
        </motion.form>

        <div className="mt-16 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            All listings undergo a 48-hour curation review before going live
          </p>
        </div>
      </div>
    </div>
  );
}