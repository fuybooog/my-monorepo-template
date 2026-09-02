import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrawer } from './useDrawer'

describe('useDrawer', () => {
  it('初始状态：drawer 关闭、create 模式', () => {
    const { result } = renderHook(() => useDrawer())
    expect(result.current.drawerVisible).toBe(false)
    expect(result.current.formMode).toBe('create')
    expect(result.current.drawerData).toBeUndefined()
    expect(result.current.extendDrawerData).toBeUndefined()
  })

  it('支持自定义初始模式', () => {
    const { result } = renderHook(() => useDrawer('edit'))
    expect(result.current.formMode).toBe('edit')
  })

  it("openDrawer('edit') 打开抽屉并写入数据", () => {
    const { result } = renderHook(() => useDrawer())
    act(() => {
      result.current.openDrawer('edit', { id: 1, name: 'x' }, { extra: true })
    })
    expect(result.current.drawerVisible).toBe(true)
    expect(result.current.formMode).toBe('edit')
    expect(result.current.drawerData).toEqual({ id: 1, name: 'x' })
    expect(result.current.extendDrawerData).toEqual({ extra: true })
  })

  it('closeDrawer 仅关闭抽屉，保留数据与模式', () => {
    const { result } = renderHook(() => useDrawer())
    act(() => {
      result.current.openDrawer('edit', { id: 1 })
    })
    act(() => {
      result.current.closeDrawer()
    })
    expect(result.current.drawerVisible).toBe(false)
    expect(result.current.formMode).toBe('edit')
    expect(result.current.drawerData).toEqual({ id: 1 })
  })
})
