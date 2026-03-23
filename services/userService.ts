import { apiClient } from '../lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'individual' | 'builder' | 'admin';
  created_at: string;
}

export const userService = {
  getAll: async () => {
    const response = await apiClient.get<UserProfile[]>('/users');
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
