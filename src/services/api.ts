import apiClient from '../shared/services/apiClient';
import type {
  User,
  ChatRoom,
  Message,
  Report,
  PaginatedResponse,
  MessageFilter,
  ReportFilter,
  DashboardStats,
} from '../shared/types';

// Dashboard
export const getDashboardStats = () =>
  apiClient.get<DashboardStats>('/admin/dashboard/stats').then((r) => r.data);

// Users
export const getUsers = (params?: { page?: number; size?: number; search?: string }) =>
  apiClient.get<PaginatedResponse<User>>('/admin/users', { params }).then((r) => r.data);

export const getUserById = (id: number) =>
  apiClient.get<User>(`/admin/users/${id}`).then((r) => r.data);

export const muteUser = (userId: number, durationMinutes?: number) =>
  apiClient.post(`/admin/users/${userId}/mute`, { durationMinutes }).then((r) => r.data);

export const unmuteUser = (userId: number) =>
  apiClient.post(`/admin/users/${userId}/unmute`).then((r) => r.data);

export const banUser = (userId: number, reason?: string) =>
  apiClient.post(`/admin/users/${userId}/ban`, { reason }).then((r) => r.data);

export const unbanUser = (userId: number) =>
  apiClient.post(`/admin/users/${userId}/unban`).then((r) => r.data);

// Chat Rooms
export const getChatRooms = () =>
  apiClient.get<ChatRoom[]>('/admin/rooms').then((r) => r.data);

export const getChatRoomById = (id: number) =>
  apiClient.get<ChatRoom>(`/admin/rooms/${id}`).then((r) => r.data);

// Messages
export const getMessages = (filter?: MessageFilter) =>
  apiClient.get<PaginatedResponse<Message>>('/admin/messages', { params: filter }).then((r) => r.data);

export const getMessagesByRoom = (roomId: number, params?: { page?: number; size?: number }) =>
  apiClient.get<PaginatedResponse<Message>>(`/admin/rooms/${roomId}/messages`, { params }).then((r) => r.data);

export const deleteMessage = (messageId: number) =>
  apiClient.delete(`/admin/messages/${messageId}`).then((r) => r.data);

// Reports
export const getReports = (filter?: ReportFilter) =>
  apiClient.get<PaginatedResponse<Report>>('/admin/reports', { params: filter }).then((r) => r.data);

export const resolveReport = (reportId: number) =>
  apiClient.post(`/admin/reports/${reportId}/resolve`).then((r) => r.data);

export const dismissReport = (reportId: number) =>
  apiClient.post(`/admin/reports/${reportId}/dismiss`).then((r) => r.data);

// Auth
export const adminLogin = (username: string, password: string) =>
  apiClient.post<{ token: string; user: User }>('/auth/admin/login', { username, password }).then((r) => r.data);

export const adminLogout = () =>
  apiClient.post('/auth/logout').then((r) => r.data);
