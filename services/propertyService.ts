import { apiClient } from '../lib/apiClient';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'pending' | 'available' | 'sold' | 'rejected';

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
    const res = await apiClient.get('/properties/stats');
    return res.data;
  },

  getAll: async (): Promise<Property[]> => {
    const res = await apiClient.get('/properties');
    return res.data;
  },

  search: async (params: Record<string, any>): Promise<Property[]> => {
    const res = await apiClient.get('/properties/search', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Property> => {
    const res = await apiClient.get(`/properties/${id}`);
    return res.data;
  },

  create: async (data: CreatePropertyPayload): Promise<Property> => {
    const res = await apiClient.post('/properties', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreatePropertyPayload>): Promise<Property> => {
    const res = await apiClient.patch(`/properties/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },

  // ✅ NEW ADMIN APIs

  getPending: async (): Promise<Property[]> => {
    const res = await apiClient.get('/properties/admin/pending');
    return res.data;
  },

  approve: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/approve/${id}`);
    return res.data;
  },

  reject: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/reject/${id}`);
    return res.data;
  }
};