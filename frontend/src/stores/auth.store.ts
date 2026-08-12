import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user.types';

interface AuthStore {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
    }),
    { name: 'auth-store' }
  )
);
