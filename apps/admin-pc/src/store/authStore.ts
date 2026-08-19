import { Backend } from '@repo/types'
import { create } from 'zustand'

interface AuthState {
  auth: Backend.CurrentLoginResponseDto | null
  isAuthenticated: boolean
  setAuth: (auth: Backend.CurrentLoginResponseDto) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  auth: null,
  isAuthenticated: false,
  setAuth: (auth) => set({ auth, isAuthenticated: true }),
  clearAuth: () => set({ auth: null, isAuthenticated: false }),
  isAdmin: () => {
    const roles = get().auth?.roles || []
    return roles.includes('admin')
  },
}))
