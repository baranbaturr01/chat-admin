import { useAuthStore } from '../../features/auth/store/authStore';

export const useAuth = () => {
  return useAuthStore();
};
