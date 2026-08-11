import authApi from '@/features/auth/api/auth'
import { useAuthStore } from '@/store/authStore'
import { redirect } from 'react-router-dom'

export async function protectedLoader() {
  const authState = useAuthStore.getState()
  if (authState.isAuthenticated) {
    return true
  }
  try {
    const loginRes = await authApi.currentLogin()
    if (loginRes.head.errCode === 0) {
      authState.setAuth(loginRes.data!)
      return true
    } else {
      authState.clearAuth()
      return redirect('/login')
    }
  } catch {
    authState.clearAuth()
    return redirect('/login')
  }
}
