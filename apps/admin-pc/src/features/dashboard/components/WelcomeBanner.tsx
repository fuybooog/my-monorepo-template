import { Tag } from 'antd'
import { useAuthStore } from '@/store/authStore'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/** 角色 code → 展示名（未内置的 code 原样展示） */
const ROLE_LABEL_MAP: Record<string, string> = {
  admin: '超级管理员',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function WelcomeBanner() {
  const auth = useAuthStore((state) => state.auth)
  const now = new Date()
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${WEEKDAYS[now.getDay()]}`
  const displayName = auth?.nickName || auth?.userName || ''

  return (
    <div
      className="relative overflow-hidden rounded-xl px-6 py-6 text-white shadow-sm"
      style={{ background: 'linear-gradient(120deg, #3b82f6 0%, #6366f1 100%)' }}
    >
      <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold">
            {getGreeting()}，{displayName}
          </div>
          <div className="mt-1 text-sm text-white/80">
            {dateText}，欢迎使用人员管理系统，祝您工作顺利
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
          <Tag
            style={{ background: 'rgba(255,255,255,0.24)', color: '#fff', border: 'none' }}
            className="mr-0"
          >
            账号：{auth?.userName}
          </Tag>
          {(auth?.roleCodes || []).map((code) => (
            <Tag
              key={code}
              style={{ background: 'rgba(255,255,255,0.24)', color: '#fff', border: 'none' }}
              className="mr-0"
            >
              {ROLE_LABEL_MAP[code] ?? code}
            </Tag>
          ))}
          <Tag
            style={{ background: 'rgba(255,255,255,0.24)', color: '#fff', border: 'none' }}
            className="mr-0"
          >
            授权权限点：{auth?.permissions.length ?? 0}
          </Tag>
        </div>
      </div>
    </div>
  )
}
