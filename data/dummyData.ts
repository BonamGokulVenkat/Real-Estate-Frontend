import type { Property, User, Agency, Review, Transaction } from "@/types";

import property1 from "@/public/property-1.jpg";
import property2 from "@/public/property-2.jpg";
import property3 from "@/public/property-3.jpg";
import property4 from "@/public/property-4.jpg";
import property5 from "@/public/property-5.jpg";
import property6 from "@/public/property-6.jpg";

export const properties: Property[] = [
  {
    id: "p1",
    title: "Modern Glass Villa in Hyderabad",
    price: 450000,
    bedrooms: 4,
    bathrooms: 3,
    size: 3500,
    type: "villa",
    status: "available",
    location: { city: "Hyderabad", state: "Telangana", country: "India" },
    images: [property1, property5],
    description: "A stunning contemporary glass villa featuring open-plan living spaces, infinity pool, and panoramic city views. Built with premium materials and smart home technology throughout.",
    sellerId: "u2",
    agencyId: "a1",
    featured: true,
    yearBuilt: 2024,
    amenities: ["Pool", "Smart Home", "Garden", "Parking", "Gym"],
    beds: 0
  },
  {
    id: "p2",
    title: "Skyline Penthouse in Mumbai",
    price: 1200000,
    bedrooms: 5,
    bathrooms: 4,
    size: 5200,
    type: "penthouse",
    status: "available",
    location: { city: "Mumbai", state: "Maharashtra", country: "India" },
    images: [property2, property6],
    description: "An ultra-luxury penthouse perched atop a prestigious tower. Floor-to-ceiling windows, private terrace, and world-class amenities define this extraordinary residence.",
    sellerId: "u3",
    agencyId: "a2",
    featured: true,
    yearBuilt: 2025,
    amenities: ["Terrace", "Concierge", "Wine Cellar", "Home Theater", "Spa"],
    beds: 0
  },
  {
    id: "p3",
    title: "Mediterranean Mansion in Goa",
    price: 850000,
    bedrooms: 6,
    bathrooms: 5,
    size: 6800,
    type: "mansion",
    status: "available",
    location: { city: "Panaji", state: "Goa", country: "India" },
    images: [property3, property1],
    description: "A magnificent Mediterranean-inspired mansion with lush tropical gardens, a resort-style pool, and breathtaking sunset views over the Arabian Sea.",
    sellerId: "u2",
    agencyId: "a1",
    featured: true,
    yearBuilt: 2024,
    amenities: ["Pool", "Beach Access", "Garden", "BBQ", "Staff Quarters"],
    beds: 0
  },
  {
    id: "p4",
    title: "Contemporary Townhouse in Bangalore",
    price: 320000,
    bedrooms: 3,
    bathrooms: 2,
    size: 2400,
    type: "townhouse",
    status: "available",
    location: { city: "Bangalore", state: "Karnataka", country: "India" },
    images: [property4, property2],
    description: "A sleek, modern townhouse in a gated community. Clean architectural lines, premium finishes, and a private courtyard garden create an urban sanctuary.",
    sellerId: "u3",
    agencyId: "a3",
    featured: false,
    yearBuilt: 2025,
    amenities: ["Garden", "Parking", "Security", "Clubhouse"],
    beds: 0
  },
  {
    id: "p5",
    title: "Beachfront Villa in Chennai",
    price: 680000,
    bedrooms: 4,
    bathrooms: 4,
    size: 4100,
    type: "villa",
    status: "available",
    location: { city: "Chennai", state: "Tamil Nadu", country: "India" },
    images: [property5, property3],
    description: "Wake up to ocean views in this spectacular beachfront villa. Features an infinity pool that seems to merge with the sea, and expansive outdoor living areas.",
    sellerId: "u2",
    agencyId: "a2",
    featured: true,
    yearBuilt: 2024,
    amenities: ["Pool", "Beach Access", "Smart Home", "Solar Panels"],
    beds: 0
  },
  {
    id: "p6",
    title: "Luxury Tower Apartment in Delhi",
    price: 520000,
    bedrooms: 3,
    bathrooms: 3,
    size: 2800,
    type: "apartment",
    status: "available",
    location: { city: "New Delhi", state: "Delhi", country: "India" },
    images: [property6, property4],
    description: "An exquisite high-rise apartment offering commanding views of the capital. Italian marble, designer fixtures, and access to five-star building amenities.",
    sellerId: "u3",
    agencyId: "a3",
    featured: false,
    yearBuilt: 2025,
    amenities: ["Concierge", "Gym", "Pool", "Parking", "Security"],
    beds: 0
  },
];

export const users: User[] = [
  {
    id: "u1",
    name: "Arjun Kapoor",
    email: "arjun@example.com",
    phone: "+91 98765 43210",
    role: "buyer",
    avatar: "",
    savedProperties: ["p1", "p3"],
    listedProperties: [],
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43211",
    role: "seller",
    avatar: "",
    savedProperties: [],
    listedProperties: ["p1", "p3", "p5"],
  },
  {
    id: "u3",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    phone: "+91 98765 43212",
    role: "seller",
    avatar: "",
    savedProperties: [],
    listedProperties: ["p2", "p4", "p6"],
  },
];

export const agencies: Agency[] = [
  {
    id: "a1",
    name: "Prestige Realty Group",
    logo: "",
    location: { city: "Hyderabad", state: "Telangana", country: "India" },
    totalProperties: 24,
    rating: 4.8,
    description: "Premier luxury real estate agency specializing in new-build premium properties across South India. With over a decade of excellence, we deliver extraordinary homes.",
    phone: "+91 40 2345 6789",
    email: "info@prestigerealty.com",
    website: "www.prestigerealty.com",
    properties: ["p1", "p3"],
  },
  {
    id: "a2",
    name: "Horizon Properties",
    logo: "",
    location: { city: "Mumbai", state: "Maharashtra", country: "India" },
    totalProperties: 38,
    rating: 4.9,
    description: "India's leading luxury property specialists. From penthouses to beachfront villas, we curate the finest newly built residences for discerning buyers.",
    phone: "+91 22 3456 7890",
    email: "hello@horizonproperties.com",
    website: "www.horizonproperties.com",
    properties: ["p2", "p5"],
  },
  {
    id: "a3",
    name: "Crown Estate Partners",
    logo: "",
    location: { city: "Bangalore", state: "Karnataka", country: "India" },
    totalProperties: 18,
    rating: 4.7,
    description: "Boutique real estate firm focused on premium urban living. We connect visionary developers with distinguished buyers seeking the best in modern architecture.",
    phone: "+91 80 4567 8901",
    email: "contact@crownestate.com",
    website: "www.crownestate.com",
    properties: ["p4", "p6"],
  },
];

export const reviews: Review[] = [
  { id: "r1", userId: "u1", userName: "Arjun Kapoor", rating: 5, comment: "Absolutely stunning property. The attention to detail is remarkable.", date: "2025-01-15", targetId: "p1", targetType: "property" },
  { id: "r2", userId: "u1", userName: "Arjun Kapoor", rating: 5, comment: "Prestige Realty made the entire process seamless. Highly recommended!", date: "2025-02-10", targetId: "a1", targetType: "agency" },
  { id: "r3", userId: "u2", userName: "Priya Sharma", rating: 4, comment: "Beautiful design and premium finishes throughout. A joy to live in.", date: "2025-01-20", targetId: "p2", targetType: "property" },
  { id: "r4", userId: "u3", userName: "Rahul Mehta", rating: 5, comment: "Horizon Properties exceeded all expectations. Professional and knowledgeable.", date: "2025-03-01", targetId: "a2", targetType: "agency" },
  { id: "r5", userId: "u1", userName: "Arjun Kapoor", rating: 4, comment: "Great location and modern amenities. The pool area is spectacular.", date: "2025-02-28", targetId: "p3", targetType: "property" },
];

export const transactions: Transaction[] = [
  { id: "t1", propertyId: "p1", buyerId: "u1", sellerId: "u2", amount: 450000, date: "2025-01-20", status: "completed" },
  { id: "t2", propertyId: "p2", buyerId: "u1", sellerId: "u3", amount: 1200000, date: "2025-02-15", status: "pending" },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};
