import { Backend } from "@repo/types";
import { create } from "zustand";

interface AuthState {
  auth: Backend.CurrentLoginResponseDto | null
  isAuthenticated: boolean
  setAuth: (auth: Backend.CurrentLoginResponseDto) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  auth: null,
  isAuthenticated: false,
  setAuth: (auth) => set({auth, isAuthenticated: true}),
  clearAuth: () => set({auth: null, isAuthenticated: false})
}))