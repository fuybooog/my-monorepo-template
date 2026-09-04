import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const goHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <Result
        status={403}
        title="403"
        subTitle="抱歉，您没有权限访问该页面，请联系管理员开通权限"
        extra={
          <Button type="primary" onClick={goHome}>
            {isAuthenticated ? '返回首页' : '去登录'}
          </Button>
        }
      />
    </div>
  )
}
