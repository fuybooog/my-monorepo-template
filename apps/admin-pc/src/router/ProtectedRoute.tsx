import { useAuthStore } from '@/store/authStore'
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  permission?: string[] // 可选权限码，如果不传则不需要权限
  children: ReactNode
}

export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  if (permission?.length && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }
  return <>{children}</>
}
