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
  plan?: string;
  propertyLimit?: number;
  propertiesPosted?: number;
  subscriptionExpiresAt?: string | Date;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'auth-storage';

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
      logout: () => {
        // Clear in-memory state immediately
        set({ user: null, isAuthenticated: false });
        // Also wipe the persisted localStorage entry so no stale
        // data can be re-hydrated on next render / page navigation
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // localStorage may not be available in SSR context — safe to ignore
        }
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

