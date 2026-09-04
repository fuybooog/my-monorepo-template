import { WARNING_MESSAGE } from '@/constants/message'
import authApi from '@/features/auth/api/auth'
import { useAuthStore } from '@/store/authStore'
import { getMessage } from '@/utils/antd-instance'
import { redirect } from 'react-router-dom'

export async function protectedLoader() {
  const authState = useAuthStore.getState()
  if (authState.isAuthenticated) {
    return true
  }
  try {
    const loginRes = await authApi.currentLogin()
    const data = loginRes.data
    // 兜底校验：即使接口返回 errCode===0，缺少有效用户信息或角色也视为会话失效，
    // 避免后端异常（如刷新令牌后角色信息丢失）导致用户卡在无权限页面
    const valid =
      loginRes.head.errCode === 0 && data && data.id != null && (data.roleCodes?.length ?? 0) > 0
    if (valid) {
      authState.setAuth(data)
      return true
    }
    authState.clearAuth()
    if (loginRes.head.errCode === 0) {
      getMessage().warning(WARNING_MESSAGE.SESSION_INVALID)
    }
    return redirect('/login')
  } catch {
    authState.clearAuth()
    return redirect('/login')
  }
}
