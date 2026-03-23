import { apiClient } from './api';
import type { LoginCredentials, AuthUser } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Mock response for development
    if (credentials.email === 'admin@chat.com' && credentials.password === 'admin123') {
      const mockUser: AuthUser = {
        id: '1',
        email: 'admin@chat.com',
        username: 'Admin',
        role: 'admin',
        token: 'mock-jwt-token-' + Date.now(),
      };
      return mockUser;
    }
    const response = await apiClient.post<AuthUser>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  async getProfile(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/auth/profile');
    return response.data;
  },
};
