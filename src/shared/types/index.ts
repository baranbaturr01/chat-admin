export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned' | 'inactive';
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'moderator';
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DashboardStats {
  onlineUsers: number;
  activeChats: number;
  totalMessages: number;
  errorLogs: number;
  newUsersToday: number;
  bannedUsers: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  roomId: string;
  roomName: string;
  createdAt: string;
  isReported: boolean;
  reportCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
