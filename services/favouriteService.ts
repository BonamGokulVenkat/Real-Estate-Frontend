import { apiClient } from '../lib/apiClient';
import { Property } from './propertyService';

export interface FavoriteItem {
  favorite_id: string;
  property: Property;
  user: { user_id: string };
  created_at: string;
}

export const favouriteService = {
  addFavorite: async (propertyId: string): Promise<FavoriteItem> => {
    const response = await apiClient.post<FavoriteItem>(`/favorites/${propertyId}`);
    return response.data;
  },

  removeFavorite: async (propertyId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/favorites/${propertyId}`);
    return response.data;
  },

  getFavorites: async (): Promise<FavoriteItem[]> => {
    const response = await apiClient.get<FavoriteItem[]>('/favorites');
    return response.data;
  }
};
