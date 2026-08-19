import { useAuthStore } from '@/store/authStore'

export const isAdmin = (roleCode: string): boolean => roleCode === 'admin'

export const checkUserIsAdmin = (): boolean => useAuthStore.getState().isAdmin()
