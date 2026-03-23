import { apiClient } from '../lib/apiClient';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'individual' | 'builder';
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string; // adjust if backend returns user_id
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  }
};
