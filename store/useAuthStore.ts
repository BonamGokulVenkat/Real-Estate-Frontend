import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'individual' | 'builder' | 'admin';

export interface UserProfile {
  id?: string;       // legacy alias
  user_id: string;  // canonical ID from backend
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  specializations?: string[];
  date_joined?: Date;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
