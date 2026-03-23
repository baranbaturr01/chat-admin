import { apiClient } from './api';
import type { User, PaginatedResponse } from '../types';

export const usersService = {
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>('/users', {
        params: { page, limit },
      });
      return response.data;
    } catch {
      // Mock data for development
      return {
        data: generateMockUsers(),
        total: 50,
        page,
        limit,
      };
    }
  },

  async banUser(userId: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/ban`);
    return response.data;
  },

  async unbanUser(userId: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/unban`);
    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },
};

function generateMockUsers(): User[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    username: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i === 0 ? 'admin' : i === 1 ? 'moderator' : 'user',
    status: i % 7 === 0 ? 'banned' : i % 5 === 0 ? 'inactive' : 'active',
    createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
    lastLogin: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}
