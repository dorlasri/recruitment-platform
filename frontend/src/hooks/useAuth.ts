'use client';
import { create } from 'zustand';
import { User, setAuth, clearAuth, getUser, getToken } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,

  loadFromStorage: () => {
    set({ user: getUser(), token: getToken() });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.login({ email, password });
      setAuth(data.token, data.user);
      set({ user: data.user, token: data.token });
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await authApi.register(payload);
      setAuth(data.token, data.user);
      set({ user: data.user, token: data.token });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    clearAuth();
    set({ user: null, token: null });
  },
}));
