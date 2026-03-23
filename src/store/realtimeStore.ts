import { create } from 'zustand';
import type { Message, Report } from '../shared/types';

interface RealtimeState {
  isConnected: boolean;
  realtimeMessages: Message[];
  realtimeReports: Report[];
  setConnected: (connected: boolean) => void;
  addRealtimeMessage: (message: Message) => void;
  addRealtimeReport: (report: Report) => void;
  removeRealtimeMessage: (messageId: number) => void;
  clearRealtimeMessages: () => void;
  clearRealtimeReports: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  realtimeMessages: [],
  realtimeReports: [],
  setConnected: (connected) => set({ isConnected: connected }),
  addRealtimeMessage: (message) =>
    set((state) => ({
      realtimeMessages: [message, ...state.realtimeMessages].slice(0, 100),
    })),
  addRealtimeReport: (report) =>
    set((state) => ({
      realtimeReports: [report, ...state.realtimeReports].slice(0, 50),
    })),
  removeRealtimeMessage: (messageId) =>
    set((state) => ({
      realtimeMessages: state.realtimeMessages.filter((m) => m.id !== messageId),
    })),
  clearRealtimeMessages: () => set({ realtimeMessages: [] }),
  clearRealtimeReports: () => set({ realtimeReports: [] }),
}));
