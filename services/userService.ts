import { apiClient } from '../lib/apiClient';

export interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'individual' | 'builder' | 'admin';
  created_at?: string;
  date_joined?: string;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  specializations?: string[];
  properties?: any[];
}

export const userService = {
  getAll: async () => {
    const response = await apiClient.get<UserProfile[]>('/users');
    return response.data;
  },

  getBuilders: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get<UserProfile[]>('/users/builders');
    return response.data;
  },

  updateProfile: async (dto: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/users/profile', dto);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  updateRole: async (id: string, role: string) => {
    const response = await apiClient.patch(`/users/${id}`, { role });
    return response.data;
  }
};
