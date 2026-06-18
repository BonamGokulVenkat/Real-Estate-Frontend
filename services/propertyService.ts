// services/propertyService.ts
import { apiClient } from '../lib/apiClient';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'townhouse' | 'mansion' | 'penthouse';
export type PropertyStatus = 'pending' | 'available' | 'sold' | 'rejected' | 'edit_pending' | 'delete_pending';

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
  size_sqft: number | null;
  price: string;
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
  pending_action?: 'edit' | 'delete';
  original_property_id?: string;
  date_added: string;
  updated_at: string;
  media?: PropertyMedia[];
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size_sqft?: number;
  price: string;
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
  media?: any[];
  builder?: { user_id: string };
}

export const propertyService = {
  getCities: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>(`/properties/cities`);
    return Array.isArray(res.data) ? res.data : [];
  },

  getStats: async (): Promise<{ totalProperties: number; totalBuilders: number; totalCities: number }> => {
    const res = await apiClient.get('/properties/stats');
    return res.data;
  },

  getAll: async (): Promise<Property[]> => {
    const res = await apiClient.get('/properties');
    return Array.isArray(res.data) ? res.data : [];
  },

  search: async (params: Record<string, any>): Promise<Property[]> => {
    const res = await apiClient.get('/properties/search', { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: async (id: string): Promise<Property> => {
    const res = await apiClient.get(`/properties/${id}`);
    return res.data;
  },

  create: async (data: CreatePropertyPayload): Promise<Property> => {
    const res = await apiClient.post('/properties', data);
    return res.data;
  },

  // ✅ NEW: Get builder's own properties (includes pending)
  getMyProperties: async (): Promise<Property[]> => {
    const res = await apiClient.get('/properties/my-properties');
    return Array.isArray(res.data) ? res.data : [];
  },

  // ✅ NEW: Request edit (builder)
  requestEdit: async (id: string, data: Partial<CreatePropertyPayload>): Promise<Property> => {
    const res = await apiClient.patch(`/properties/request-edit/${id}`, data);
    return res.data;
  },

  // ✅ NEW: Request deletion (builder)
  requestDelete: async (id: string, reason?: string): Promise<Property> => {
    const res = await apiClient.post(`/properties/request-delete/${id}`, { reason });
    return res.data;
  },

  // ✅ ADMIN: Get all pending requests
  getPendingRequests: async (): Promise<{ edit_pending: Property[]; delete_pending: Property[] }> => {
    const res = await apiClient.get('/properties/admin/pending-requests');
    return res.data;
  },

  // ✅ ADMIN: Get pending new properties
  getPending: async (): Promise<Property[]> => {
    const res = await apiClient.get('/properties/admin/pending');
    return Array.isArray(res.data) ? res.data : [];
  },

  // ✅ ADMIN: Approve property
  approve: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/approve/${id}`);
    return res.data;
  },

  // ✅ ADMIN: Reject property
  reject: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/reject/${id}`);
    return res.data;
  },

  // ✅ ADMIN: Approve edit request
  approveEdit: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/approve-edit/${id}`);
    return res.data;
  },

  // ✅ ADMIN: Reject edit request
  rejectEdit: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/admin/reject-edit/${id}`);
  },

  // ✅ ADMIN: Approve deletion request
  approveDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/admin/approve-delete/${id}`);
  },

  // ✅ ADMIN: Reject deletion request
  rejectDelete: async (id: string): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/reject-delete/${id}`);
    return res.data;
  },

  // ✅ ADMIN: Direct update (emergency)
  directUpdate: async (id: string, data: Partial<CreatePropertyPayload>): Promise<Property> => {
    const res = await apiClient.patch(`/properties/admin/direct-update/${id}`, data);
    return res.data;
  },

  // ✅ ADMIN: Direct delete (emergency)
  directDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/admin/direct-delete/${id}`);
  },

  // In propertyService.ts - add this method

  getAdminStats: async (): Promise<{
    totalUsers: number;
    totalBuilders: number;
    totalProperties: number;
    portfolioValue: number;
    monthlyStats?: Array<{ month: string; count: number }>;
  }> => {
    const res = await apiClient.get('/properties/admin/stats');
    return res.data;
  }
};