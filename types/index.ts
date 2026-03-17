import type { StaticImageData } from "next/image";

export interface Location {
  city: string;
  state: string;
  country: string;
}

// @/types/index.ts (or wherever your types are)
export interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;   // Required
  bathrooms: number;  // Required
  size: number;       // Required
  type: string;
  status: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any[]; 
  description: string;
  sellerId: string;
  agencyId: string;
  featured: boolean;
  yearBuilt: number;
  amenities: string[];
  beds?: number;      // Optional
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller";
  avatar: string;
  savedProperties: string[];
  listedProperties: string[];
}

export interface Agency {
  id: string;
  name: string;
  logo: string;
  location: Location;
  totalProperties: number;
  rating: number;
  description: string;
  phone: string;
  email: string;
  website: string;
  properties: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  targetId: string;
  targetType: "property" | "agency";
}

export interface Transaction {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}
