import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'individual' | 'builder' | 'admin';

export interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  specializations?: string[];
  date_joined?: Date;
  plan?: string;
  propertyLimit?: number;
  propertiesPosted?: number;
  subscriptionExpiresAt?: string | Date;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
  setHydrated: () => void;
}

const STORAGE_KEY = 'auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
      logout: () => {
        set({ user: null, isAuthenticated: false });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // SSR safe
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        // Called once localStorage has been read and state restored
        state?.setHydrated();
      },
    }
  )
);