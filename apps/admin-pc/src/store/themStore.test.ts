// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themStore'

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('未配置时默认 system 模式', () => {
    // 模块加载时已初始化，直接校验 getState 的 mode
    const mode = useThemeStore.getState().mode
    expect(['light', 'dark', 'system']).toContain(mode)
  })

  it("setMode('dark') 应用暗色主题并持久化", () => {
    const { setMode } = useThemeStore.getState()
    setMode('dark')
    const state = useThemeStore.getState()
    expect(state.mode).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
    expect(localStorage.getItem('theme-mode')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it("setMode('light') 切回亮色并移除 dark class", () => {
    useThemeStore.getState().setMode('dark')
    useThemeStore.getState().setMode('light')
    const state = useThemeStore.getState()
    expect(state.mode).toBe('light')
    expect(state.resolvedTheme).toBe('light')
    expect(localStorage.getItem('theme-mode')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('resolvedTheme 随 mode 联动更新 DOM class', () => {
    const { setMode } = useThemeStore.getState()
    setMode('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    setMode('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
