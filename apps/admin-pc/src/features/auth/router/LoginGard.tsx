import { LoginPage } from '@/features/auth/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'
import { Navigate } from 'react-router-dom'

export function LoginGard() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <LoginPage />
}
