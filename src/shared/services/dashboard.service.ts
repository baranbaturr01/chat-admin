import { apiClient } from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch {
      // Mock data for development
      return {
        onlineUsers: 142,
        activeChats: 38,
        totalMessages: 15420,
        errorLogs: 3,
        newUsersToday: 24,
        bannedUsers: 7,
      };
    }
  },
};
