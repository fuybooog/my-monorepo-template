import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function NotFoundPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const goHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <Result
        status={404}
        title="404"
        subTitle="抱歉，您访问的页面不存在或已被移除"
        extra={
          <Button type="primary" onClick={goHome}>
            {isAuthenticated ? '返回首页' : '去登录'}
          </Button>
        }
      />
    </div>
  )
}
