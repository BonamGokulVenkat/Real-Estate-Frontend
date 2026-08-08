"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Search, Loader2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import PropertyCard from "@/components/common/PropertyCard";
import { propertyService, Property } from "@/services/propertyService";

const types = ["all", "villa", "apartment", "house", "land", "commercial"] as const;

export default function JustForYou() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice, currency, getConvertedPrice, rates } = useCurrency();

  // ── Guard flag: true while we are the ones updating the URL ──
  const isSelfUpdate = useRef(false);

  // ── Initialize filters from URL params ─────────────────
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get("type") || "all"
  );
  const [countryFilter, setCountryFilter] = useState<string>(
    searchParams.get("country") || "all"
  );
  const [cityFilter, setCityFilter] = useState<string>(
    searchParams.get("city") || "all"
  );
  const [sortBy, setSortBy] = useState<string>("newest");
  // Store the user's budget in INR (null = "no limit / slider at max")
  const [userMaxPriceINR, setUserMaxPriceINR] = useState<number | null>(null);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch max price from backend ──────────────────────────
  const { data: maxPriceInINR = 100000000 } = useQuery<number>({
    queryKey: ["max-price", countryFilter],
    queryFn: () => propertyService.getMaxPrice(countryFilter !== "all" ? countryFilter : undefined),
    staleTime: 5 * 60 * 1000,
  });

  // ── Calculate max price in current currency ──────────────
  const maxPriceInCurrency = getConvertedPrice(maxPriceInINR);
  const maxPriceCeiling = Math.ceil(maxPriceInCurrency);

  // ── Get display max for slider ────────────────────────────
  const sliderMax = maxPriceCeiling > 0 ? maxPriceCeiling : 10000000;

  // ── Slider display value: convert user's INR budget → current currency ──
  // If user hasn't set a budget yet, slider sits at sliderMax
  const sliderValue = userMaxPriceINR !== null
    ? Math.min(Math.ceil(getConvertedPrice(userMaxPriceINR)), sliderMax)
    : sliderMax;

  // ── Convert slider value to INR for backend ──────────────
  const getPriceInINR = (valueInCurrency: number): number => {
    const rate = rates[currency] || 1;
    return Math.ceil(valueInCurrency / rate);
  };

  // ── Sync URL params → state (only for external navigation, e.g. footer links) ──
  useEffect(() => {
    // Skip when this component itself just updated the URL
    if (isSelfUpdate.current) {
      isSelfUpdate.current = false;
      return;
    }
    const type = searchParams.get("type");
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    setTypeFilter(type || "all");
    setCountryFilter(country || "all");
    setCityFilter(city || "all");

    // Restore max price (stored as currency value in URL) → convert to INR
    const maxPriceParam = searchParams.get("max_price");
    if (maxPriceParam) {
      const parsed = Number(maxPriceParam);
      if (!isNaN(parsed) && parsed > 0) {
        setUserMaxPriceINR(getPriceInINR(parsed));
      }
    } else {
      setUserMaxPriceINR(null);
    }
  }, [searchParams]);

  // ── Fetch available cities ────────────────────────────────
  const { data: availableCities = [], isLoading: citiesLoading } = useQuery<string[]>({
    queryKey: ["property-cities", countryFilter],
    queryFn: () => propertyService.getCities(countryFilter !== "all" ? countryFilter : undefined),
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch available countries ─────────────────────────────
  const { data: availableCountries = [], isLoading: countriesLoading } = useQuery<string[]>({
    queryKey: ["property-countries"],
    queryFn: () => propertyService.getCountries(),
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch filtered properties ─────────────────────────────
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["properties", typeFilter, cityFilter, countryFilter, userMaxPriceINR, minBeds, sortBy],
    queryFn: async () => {
      const params: any = {};
      if (typeFilter !== "all") params.property_type = typeFilter;
      if (cityFilter !== "all") params.city = cityFilter;
      if (countryFilter !== "all") params.country = countryFilter;
      
      // Send INR budget to backend only if user has set a limit
      if (userMaxPriceINR !== null && userMaxPriceINR < maxPriceInINR) {
        params.max_price = Math.ceil(userMaxPriceINR);
      }
      
      if (minBeds > 0) params.bedrooms = minBeds;
      console.log("SEARCH PARAMS:", params);

      const data = await propertyService.search(params);
      const getNumericPrice = (price: string) => {
        const num = Number(price);
        return isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
      };
      let sorted = [...data];
      if (sortBy === "price-asc") sorted.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
      if (sortBy === "price-desc") sorted.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));

      return sorted;
    },
    enabled: sliderMax > 0,
  });

  const filtered = properties || [];

  const handleCountryChange = (country: string) => {
    setCountryFilter(country);
    setCityFilter("all");
  };

  const handleReset = () => {
    setUserMaxPriceINR(null);
    setMinBeds(0);
    setTypeFilter("all");
    setCityFilter("all");
    setCountryFilter("all");
  };

  // ── Update URL when filters change ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (cityFilter !== "all") params.set("city", cityFilter);
    if (countryFilter !== "all") params.set("country", countryFilter);
    // Store slider value in current currency in URL for easy restoration
    if (userMaxPriceINR !== null && userMaxPriceINR < maxPriceInINR) {
      params.set("max_price", sliderValue.toString());
    }
    if (minBeds > 0) params.set("bedrooms", minBeds.toString());

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      isSelfUpdate.current = true;
      router.replace(`?${newQuery}`, { scroll: false });
    }
  }, [typeFilter, cityFilter, countryFilter, userMaxPriceINR, sliderValue, minBeds, maxPriceInINR]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-16 space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <Badge
              variant="outline"
              className="border-amber-500/20 bg-amber-500/5 text-amber-500 px-4 py-1 uppercase tracking-[0.3em] text-[10px]"
            >
              Exclusive Selection
            </Badge>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
            Just For{" "}
            <span className="text-white/40 italic font-light">You</span>
          </h1>
        </motion.div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-4 mb-12 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          {/* Property type pills */}
          <div className="flex flex-wrap items-center gap-2">
            {types.map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "ghost"}
                onClick={() => setTypeFilter(t)}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-10 px-6 transition-all ${
                  typeFilter === t
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          {/* Country filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <MapPin className="w-3 h-3 text-amber-500/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
                Country
              </span>
            </div>
            <Button
              variant={countryFilter === "all" ? "default" : "ghost"}
              onClick={() => handleCountryChange("all")}
              className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-8 px-4 transition-all ${
                countryFilter === "all"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                  : "text-white/30 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              All Countries
            </Button>

            {countriesLoading &&
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-8 w-20 rounded-xl bg-white/5 animate-pulse"
                />
              ))}

            {!countriesLoading &&
              availableCountries.map((country) => (
                <Button
                  key={country}
                  variant={countryFilter === country ? "default" : "ghost"}
                  onClick={() => handleCountryChange(country)}
                  className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-8 px-4 transition-all ${
                    countryFilter === country
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                      : "text-white/30 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {country}
                </Button>
              ))}
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          {/* City filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <MapPin className="w-3 h-3 text-amber-500/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
                City
              </span>
            </div>

            <Button
              variant={cityFilter === "all" ? "default" : "ghost"}
              onClick={() => setCityFilter("all")}
              className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-8 px-4 transition-all ${
                cityFilter === "all"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                  : "text-white/30 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              All Cities
            </Button>

            {citiesLoading &&
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-8 w-20 rounded-xl bg-white/5 animate-pulse"
                />
              ))}

            {!citiesLoading &&
              availableCities.map((city) => (
                <Button
                  key={city}
                  variant={cityFilter === city ? "default" : "ghost"}
                  onClick={() => setCityFilter(city)}
                  className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-8 px-4 transition-all ${
                    cityFilter === city
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                      : "text-white/30 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {city}
                </Button>
              ))}
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          {/* Sort + mobile filter toggle */}
          <div className="flex items-center justify-between">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-amber-500 focus:ring-0">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4 rounded-xl"
            >
              {showFilters ? (
                <X className="w-4 h-4 mr-2" />
              ) : (
                <SlidersHorizontal className="w-4 h-4 mr-2" />
              )}
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Sidebar Filters ── */}
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 shrink-0`}
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[32px] p-7 border border-white/10 sticky top-32 space-y-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif text-lg font-bold text-white">
                    Refine
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  className="text-amber-500/50 hover:text-amber-500 text-[9px] uppercase font-bold p-0 h-auto tracking-widest"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>

              <Separator className="bg-white/5" />

              {/* Price Range */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
                    Max Budget
                  </label>
                  <div className="text-right">
                    <span className="text-xl font-serif font-bold text-amber-500 tabular-nums">
                      {formatPrice(userMaxPriceINR ?? maxPriceInINR, { ceil: true })}
                    </span>
                  </div>
                </div>

                <div className="relative py-2">
                  <Slider
                    value={[sliderValue]}
                    onValueChange={(val) => setUserMaxPriceINR(getPriceInINR(val[0]))}
                    max={sliderMax}
                    min={Math.ceil(getConvertedPrice(100000))}
                    step={Math.max(1, Math.ceil(sliderMax / 200))}
                    className="relative flex items-center select-none touch-none w-full"
                  />
                </div>

                <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-white/10">
                  <span>{formatPrice(100000)}</span>
                  <span>{formatPrice(getPriceInINR(sliderMax), { ceil: true })}</span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Bedrooms
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant="outline"
                      onClick={() => setMinBeds(n)}
                      className={`h-9 rounded-lg text-[10px] font-bold transition-all border-white/5 ${
                        minBeds === n
                          ? "bg-amber-500 text-white/40 border-amber-500"
                          : "bg-white/5 hover:bg-white/10 text-white/40"
                      }`}
                    >
                      {n === 0 ? "Any" : n + "+"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Property Grid ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                Showing {filtered.length} curated listings
                {cityFilter !== "all" && (
                  <span className="text-amber-500/50 ml-2">
                    in {cityFilter}
                  </span>
                )}
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">
                Failed to load properties. Please try again later.
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-32 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
                <Search className="w-12 h-12 text-white/10 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold text-white/60">
                  No properties match your filters
                </h3>
                <p className="text-sm text-white/20 mt-2 font-light max-w-xs mx-auto">
                  Try adjusting the price range or property type to see more
                  results.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((p: any, i: number) => (
                  <PropertyCard key={p.property_id} property={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}