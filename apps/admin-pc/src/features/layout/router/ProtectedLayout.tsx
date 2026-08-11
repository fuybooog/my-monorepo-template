import { LayoutPage } from '@/features/layout/pages/LayoutPage'
import { useAuthStore } from '@/store/authStore'
import { Navigate } from 'react-router-dom'

export function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <LayoutPage />
}
