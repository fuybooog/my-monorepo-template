import { useMemo } from 'react'
import { Card, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  AppstoreOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PERMISSIONS } from '@repo/shared'

interface QuickItem {
  title: string
  desc: string
  icon: ReactNode
  path: string
  permission: string
}

const ITEMS: QuickItem[] = [
  {
    title: '用户管理',
    desc: '用户账号与角色管理',
    icon: <TeamOutlined />,
    path: '/user/list',
    permission: PERMISSIONS.SYS_USER_LIST_PAGE,
  },
  {
    title: '角色管理',
    desc: '角色与授权范围配置',
    icon: <SafetyCertificateOutlined />,
    path: '/role/list',
    permission: PERMISSIONS.SYS_ROLE_LIST_PAGE,
  },
  {
    title: '资源管理',
    desc: '菜单与接口资源维护',
    icon: <AppstoreOutlined />,
    path: '/resource/list',
    permission: PERMISSIONS.SYS_RESOURCE_LIST_PAGE,
  },
  {
    title: '值集管理',
    desc: '通用枚举值集维护',
    icon: <DatabaseOutlined />,
    path: '/value-set/list',
    permission: PERMISSIONS.SYS_VALUE_SET_LIST_PAGE,
  },
  {
    title: '操作日志',
    desc: '系统操作审计查询',
    icon: <FileSearchOutlined />,
    path: '/operation-log/list',
    permission: PERMISSIONS.SYS_OPERATION_LOG_LIST_PAGE,
  },
]

export function QuickAccess() {
  const navigate = useNavigate()
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const visibleItems = useMemo(
    () => ITEMS.filter((item) => hasPermission([item.permission])),
    [hasPermission],
  )

  return (
    <Card variant="borderless" className="h-full shadow-sm" title="快捷入口">
      {visibleItems.length === 0 ? (
        <Empty description="当前账号暂无可用功能入口" className="py-8" />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {visibleItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-lg text-blue-500">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                  {item.title}
                </div>
                <div className="truncate text-xs text-slate-400 dark:text-zinc-500">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
