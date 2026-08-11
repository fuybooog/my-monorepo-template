import { useNavigate } from 'react-router-dom'
import authApi from '@/features/auth/api/auth'

export function LoginCard() {
  const navigate = useNavigate()
  async function handleLogin() {
    const res = await authApi.passwordLogin({
      userName: '123',
      password: '111111',
      type: 'password',
    })
    if (res.head.errCode === 0) {
      navigate('/dashboard', { replace: true })
    }
  }
  return (
    <>
      <button onClick={handleLogin}>登录</button>
    </>
  )
}
