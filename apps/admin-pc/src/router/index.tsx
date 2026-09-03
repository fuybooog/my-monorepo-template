import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { rootLoader } from '@/router/rootLoader'
import { protectedLoader } from '@/features/layout/router/protectedLoader'
import { LoginGard } from '@/features/auth/router/LoginGard'
import { ProtectedLayout } from '@/features/layout/router/ProtectedLayout'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPassword'
import { UserListPage } from '@/features/user/pages/UserListPage'
import { ResourceListPage } from '@/features/resource/pages/ResourceListPage'
import { RoleListPage } from '@/features/role/pages/RoleListPage'
import { OperationLogListPage } from '@/features/operation-log/pages/OperationLogListPage'
import { ValueSetListPage } from '@/features/value-set/pages/ValueSetListPage'
import { ValueSetDetailPage } from '@/features/value-set/pages/ValueSetDetailPage'
import { PERMISSIONS } from '@repo/shared'
import { createRoutesFromConfig } from '@/router/createRoutesFromConfig'

const routeConfig = [
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
        path: 'resetPassword',
        element: <ResetPasswordPage />,
      },
      {
        path: '',
        element: <ProtectedLayout />,
        loader: protectedLoader,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'user/list',
            element: <UserListPage />,
            permission: [PERMISSIONS.SYS_USER_LIST_PAGE],
          },
          {
            path: 'resource/list',
            element: <ResourceListPage />,
            permission: [PERMISSIONS.SYS_RESOURCE_LIST_PAGE],
          },
          {
            path: 'role/list',
            element: <RoleListPage />,
            permission: [PERMISSIONS.SYS_ROLE_LIST_PAGE],
          },
          {
            path: 'operation-log/list',
            element: <OperationLogListPage />,
            permission: [PERMISSIONS.SYS_OPERATION_LOG_LIST_PAGE],
          },
          {
            path: 'value-set/list',
            element: <ValueSetListPage />,
            permission: [PERMISSIONS.SYS_VALUE_SET_LIST_PAGE],
          },
          {
            path: 'value-set/detail/:setCode',
            element: <ValueSetDetailPage />,
            permission: [PERMISSIONS.SYS_VALUE_SET_LIST_PAGE],
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
]
const routeList = createRoutesFromConfig(routeConfig)
export const router = createBrowserRouter(routeList)
