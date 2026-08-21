import { create } from '@/store/store.util'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode // 当前用户设定的模式：system | light | dark
  resolvedTheme: 'light' | 'dark' // 当前实际计算渲染出的主题：light 或 dark
  setMode: (mode: ThemeMode) => void
}

// 获取系统当前的偏好
const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

// 更新 HTML DOM 上的 class="dark"
const applyThemeToDOM = (resolved: 'light' | 'dark') => {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const savedMode = (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
const initialResolved = savedMode === 'system' ? getSystemTheme() : savedMode

// 初始化设置一次 DOM
applyThemeToDOM(initialResolved)

export const useThemeStore = create<ThemeState>((set, get) => {
  // 监听系统主题变化（仅在 mode === 'system' 时生效）
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (get().mode === 'system') {
      const nextResolved = e.matches ? 'dark' : 'light'
      applyThemeToDOM(nextResolved)
      set({ resolvedTheme: nextResolved })
    }
  })

  return {
    mode: savedMode,
    resolvedTheme: initialResolved,
    setMode: (newMode: ThemeMode) => {
      localStorage.setItem('theme-mode', newMode)
      const nextResolved = newMode === 'system' ? getSystemTheme() : newMode
      applyThemeToDOM(nextResolved)
      set({ mode: newMode, resolvedTheme: nextResolved })
    },
  }
}, 'ThemeStore')
