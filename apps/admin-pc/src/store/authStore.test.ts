// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

const buildAuth = (permissions: string[], roleCodes: string[] = []) =>
  ({
    token: 'token',
    permissions,
    roleCodes,
  }) as any

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ auth: null, isAuthenticated: false, permissionSet: new Set() })
  })

  it('初始状态未认证', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().auth).toBeNull()
  })

  it('setAuth 写入认证信息并构建权限集合', () => {
    useAuthStore.getState().setAuth(buildAuth(['system:user:list', 'system:role:list']))
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.permissionSet.has('system:user:list')).toBe(true)
    expect(state.permissionSet.size).toBe(2)
  })

  it('clearAuth 清空认证状态', () => {
    useAuthStore.getState().setAuth(buildAuth(['a']))
    useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.auth).toBeNull()
    expect(state.permissionSet.size).toBe(0)
  })

  it('isAdmin 根据 roleCodes 判断', () => {
    useAuthStore.getState().setAuth(buildAuth([], ['admin']))
    expect(useAuthStore.getState().isAdmin()).toBe(true)

    useAuthStore.getState().setAuth(buildAuth([], ['user']))
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('hasPermission：空权限列表返回 true', () => {
    useAuthStore.getState().setAuth(buildAuth([]))
    expect(useAuthStore.getState().hasPermission([])).toBe(true)
    expect(useAuthStore.getState().hasPermission(undefined as any)).toBe(true)
  })

  it('hasPermission：admin 直接放行', () => {
    useAuthStore.getState().setAuth(buildAuth([], ['admin']))
    expect(useAuthStore.getState().hasPermission(['any:thing'])).toBe(true)
  })

  it('hasPermission：OR 模式任一命中即可', () => {
    useAuthStore.getState().setAuth(buildAuth(['a']))
    expect(useAuthStore.getState().hasPermission(['a', 'b'])).toBe(true)
    expect(useAuthStore.getState().hasPermission(['c', 'd'])).toBe(false)
  })

  it('hasPermission：AND 模式需全部命中', () => {
    useAuthStore.getState().setAuth(buildAuth(['a', 'b']))
    expect(useAuthStore.getState().hasPermission(['a', 'b'], 'AND')).toBe(true)
    expect(useAuthStore.getState().hasPermission(['a', 'c'], 'AND')).toBe(false)
  })

  it('hasPermission：NOT 模式反向判断', () => {
    useAuthStore.getState().setAuth(buildAuth(['a']))
    expect(useAuthStore.getState().hasPermission(['b'], 'NOT')).toBe(true)
    expect(useAuthStore.getState().hasPermission(['a'], 'NOT')).toBe(false)
  })

  it('未登录时 hasPermission 返回 false', () => {
    expect(useAuthStore.getState().hasPermission(['a'])).toBe(false)
  })
})
