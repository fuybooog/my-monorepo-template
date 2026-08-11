import { useNavigate } from 'react-router-dom'
import { Dropdown, Avatar } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  DesktopOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'

import authApi from '@/features/auth/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, ThemeMode } from '@/store/themStore'
import reactSvg from '@/assets/react.svg'

export function LayoutTop() {
  const navigate = useNavigate()
  const { mode, setMode } = useThemeStore()

  // 假设 useAuthStore 保存了 userInfo
  const auth = useAuthStore((state) => state.auth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  async function handleLogout() {
    await authApi.logout()
    clearAuth()
    navigate('/login', { replace: true })
  }

  // 主题切换菜单项
  const themeMenuItems = [
    {
      key: 'light',
      label: '明亮模式',
      icon: <SunOutlined />,
      onClick: () => setMode('light'),
    },
    {
      key: 'dark',
      label: '暗黑模式',
      icon: <MoonOutlined />,
      onClick: () => setMode('dark'),
    },
    {
      key: 'system',
      label: '跟随系统',
      icon: <DesktopOutlined />,
      onClick: () => setMode('system'),
    },
  ]

  // 用户个人中心下拉菜单
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1 text-xs text-slate-500 border-b border-slate-100 dark:border-zinc-800">
          <div>账号: {auth?.userName}</div>
          {/* 后续扩展字段 */}
        </div>
      ),
      disabled: true,
    },
    {
      key: 'logout',
      label: '退出系统',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="h-full flex items-center justify-between px-4 flex-none border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      {/* 左侧：Logo + 系统名称 */}
      <div className="flex items-center gap-3">
        <img src={reactSvg} alt="Logo" className="w-6 h-6 animate-spin-slow dark:brightness-125" />
        <span className="font-semibold text-base text-slate-800 dark:text-slate-100 tracking-wide">
          人员管理系统
        </span>
      </div>

      {/* 右侧：主题切换 + 个人信息下拉菜单 */}
      <div className="flex items-center gap-4">
        {/* 1. 三态主题切换下拉菜单 */}
        <Dropdown menu={{ items: themeMenuItems, selectedKeys: [mode] }} placement="bottomRight">
          <button className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
            {mode === 'light' && <SunOutlined />}
            {mode === 'dark' && <MoonOutlined />}
            {mode === 'system' && <DesktopOutlined />}
            <span>{mode === 'light' ? '明亮' : mode === 'dark' ? '暗黑' : '跟随系统'}</span>
          </button>
        </Dropdown>

        {/* 2. 用户头像与信息下拉菜单 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <Avatar icon={<UserOutlined />} size="small" className="bg-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {auth?.userName}
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
