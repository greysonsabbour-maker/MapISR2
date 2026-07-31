import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/config/auth';
import { AUTH_CREDENTIALS, SESSION_KEY } from '@/config/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (password: string) => {
        const trimmed = password.trim().toLowerCase();
        const entry = AUTH_CREDENTIALS[trimmed];
        if (!entry || entry.password !== trimmed) return false;

        const user: AuthUser = {
          username: trimmed,
          role: entry.role,
          displayName: entry.displayName,
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: SESSION_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'admin');
