"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/common/ui/input";

interface GeoapifyAutocompleteProps {
  onSelect: (data: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    address: string;
  }) => void;
  onClear?: () => void;
  className?: string;
  defaultValue?: string;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "dummy_key";

export function GeoapifyAutocomplete({ onSelect, onClear, className, defaultValue = "" }: GeoapifyAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) {
         throw new Error("Failed to fetch autocomplete suggestions");
      }
      
      const data = await response.json();
      setSuggestions(data.features || []);
      setIsOpen((data.features || []).length > 0);
    } catch (error) {
      console.error("Geoapify Autocomplete Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue && inputValue !== defaultValue && inputValue.length >= 3) {
        fetchSuggestions(inputValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue, fetchSuggestions, defaultValue]);

  const handleSelect = (feature: any) => {
    const { properties, geometry } = feature;
    const city = properties.city || properties.town || properties.village || "";
    const state = properties.state || "";
    const lat = geometry.coordinates[1];
    const lng = geometry.coordinates[0];
    const address = properties.formatted || "";

    setInputValue(address);
    setSuggestions([]);
    setIsOpen(false);
    onSelect({ city, state, lat, lng, address });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value.length < 3) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 3 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search for property location (e.g. Central Park, New York)"
          className="bg-white/[0.03] border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 text-white placeholder:text-white/20 h-12 pl-12 pr-10"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          </div>
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setSuggestions([]);
              setIsOpen(false);
              setSelectedIndex(-1);
              onClear?.();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-2 bg-[#0D2137] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((feature, index) => (
            <li
              key={index}
              onClick={() => handleSelect(feature)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors ${
                selectedIndex === index ? "bg-white/10 text-amber-500" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <MapPin className={`w-4 h-4 mt-1 flex-shrink-0 ${selectedIndex === index ? "text-amber-500" : "text-white/20"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                   {feature.properties.address_line1}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5 truncate">
                  {feature.properties.address_line2}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
