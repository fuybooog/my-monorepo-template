import { Backend } from '@repo/types'
import { create } from '@/store/store.util'

interface AuthState {
  auth: Backend.CurrentLoginResponseDto | null
  isAuthenticated: boolean
  permissionSet: Set<string>
  setAuth: (auth: Backend.CurrentLoginResponseDto) => void
  clearAuth: () => void
  isAdmin: () => boolean
  hasPermission: (requiredPermissions?: string[], mode?: 'OR' | 'AND' | 'NOT') => boolean
}

export const useAuthStore = create<AuthState>(
  (set, get) => ({
    auth: null,
    isAuthenticated: false,
    permissionSet: new Set<string>(),

    setAuth: (auth) =>
      set({
        auth,
        isAuthenticated: true,
        permissionSet: new Set(auth?.permissions || []),
      }),

    clearAuth: () =>
      set({
        auth: null,
        isAuthenticated: false,
        permissionSet: new Set<string>(),
      }),

    isAdmin: () => {
      const roles = get().auth?.roles || []
      return roles.includes('admin')
    },

    hasPermission: (requiredPermissions, mode = 'OR') => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true

      const { permissionSet, isAdmin } = get()

      if (isAdmin()) return true

      // 根据 mode 分支匹配
      switch (mode) {
        case 'AND':
          // 必须同时包含所有要求的权限
          return requiredPermissions.every((per) => permissionSet.has(per))

        case 'NOT':
          // 必须全都不包含（黑名单机制，如某些特定节点对部分角色隐蔽）
          return requiredPermissions.every((per) => !permissionSet.has(per))

        case 'OR':
        default:
          // 只要包含其中任意一个权限即可
          return requiredPermissions.some((per) => permissionSet.has(per))
      }
    },
  }),
  'AuthStore',
)
