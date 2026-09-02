import { getMessage } from '@/utils/antd-instance'
import { HttpClient } from '@repo/api'
import { ERROR_MESSAGE } from '@/constants'

const http = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  onBusinessError(errMsg) {
    getMessage().error(ERROR_MESSAGE.SYSTEM + errMsg)
  },
  onError(error) {
    // 鉴权错误，跳转登录
    // 系统错误，对应处理
    console.error('onError', error)
    if (error.head.errCode === -2) {
      // 权限认证失败，跳转到登录页面
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }
  },
  async refreshTokenHandler() {
    // 动态引入避免与 auth api 循环依赖
    try {
      const { default: authApi } = await import('@/features/auth/api/auth')
      await authApi.refresh()
      return true
    } catch {
      return false
    }
  },
})

export default http
