import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { rootLoader } from '@/router/rootLoader'
import { protectedLoader } from '@/features/layout/router/protectedLoader'
import { LoginGard } from '@/features/auth/router/LoginGard'
import { ProtectedLayout } from '@/features/layout/router/ProtectedLayout'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPassword'
import { UserListPage } from '@/features/user/pages/UserListPage'
import { ResourceListPage } from '@/features/resource/pages/ResourceListPage'

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    loader: rootLoader,
    children: [
      {
        path: 'login',
        element: <LoginGard />,
      },
      {
        path: '',
        element: <ProtectedLayout />,
        loader: protectedLoader,
        children: [
          {
            path: 'resetPassword',
            element: <ResetPasswordPage />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'user/list',
            element: <UserListPage />,
          },
          {
            path: 'resource/list',
            element: <ResourceListPage />,
          },
          {
            path: '*',
            element: <Navigate to={'/dashboard'} replace />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to={'/login'} replace />,
      },
    ],
  },
])
