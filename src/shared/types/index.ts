// Shared type definitions for Chat Admin Panel

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  status: 'ACTIVE' | 'MUTED' | 'BANNED';
  createdAt: string;
  totalMessages: number;
  avatarUrl?: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  messageCount: number;
  isActive: boolean;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  chatRoomId: number;
  chatRoomName: string;
  createdAt: string;
  isDeleted: boolean;
  isReported: boolean;
  reportCount: number;
}

export interface Report {
  id: number;
  messageId: number;
  messageContent: string;
  reportedUserId: number;
  reportedUsername: string;
  reporterUserId: number;
  reporterUsername: string;
  chatRoomId: number;
  chatRoomName: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminUsername: string;
  action: string;
  targetType: 'USER' | 'MESSAGE' | 'ROOM';
  targetId: number;
  details: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MessageFilter {
  chatRoomId?: number;
  senderId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface ReportFilter {
  status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  chatRoomId?: number;
  page?: number;
  size?: number;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  pendingReports: number;
  newUsersToday: number;
  messagesToday: number;
}

export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_DELETED' | 'USER_BANNED' | 'USER_MUTED' | 'NEW_REPORT';
  payload: Message | User | Report;
  timestamp: string;
}
