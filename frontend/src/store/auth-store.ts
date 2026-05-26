import { create } from 'zustand';
import api from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.accessToken });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.accessToken });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        set({ user: JSON.parse(storedUser), token, isLoading: false });
        const { data } = await api.get('/auth/profile');
        set({ user: data });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
