import { apiClient } from '../lib/apiClient';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'available' | 'sold' | 'pending';

export interface PropertyMedia {
  media_id: string;
  media_url: string;
  url: string;
  media_type: string;
}

export interface Property {
  property_id: string;
  builder?: {
    user_id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: number;
    lat: number;
    lng: number;
  };
  features: string[];
  status: PropertyStatus;
  date_added: string;
  media?: PropertyMedia[];
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: number;
    lat: number;
    lng: number;
  };
  features: string[];
  status?: PropertyStatus;
}

export const propertyService = {
  getCities: async (): Promise<string[]> => {
  const res = await apiClient.get<string[]>(`/properties/cities`);
  return res.data;
},
  getStats: async (): Promise<{ totalProperties: number; totalBuilders: number; totalCities: number }> => {
    const res = await apiClient.get<{ totalProperties: number; totalBuilders: number; totalCities: number }>('/properties/stats');
    return res.data;
  },
  getAll: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties');
    return response.data;
  },
  search: async (params: Record<string, any>): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties/search', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  },
  create: async (data: CreatePropertyPayload): Promise<Property> => {
    const response = await apiClient.post<Property>('/properties', data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreatePropertyPayload>): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  }
};

