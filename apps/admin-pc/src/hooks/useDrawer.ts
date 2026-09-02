import { SmartFormEditMode } from '@/components/common'
import { useCallback, useState } from 'react'

export const useDrawer = <T = unknown>(initialMode: SmartFormEditMode = 'create') => {
  const [drawerState, setDrawerState] = useState<{
    drawerVisible: boolean
    formMode: SmartFormEditMode
    drawerData?: T | number
    extendDrawerData?: unknown
  }>({
    drawerVisible: false,
    formMode: initialMode,
  })

  const openDrawer = useCallback(
    (formMode: SmartFormEditMode, drawerData?: T | number, extendDrawerData?: unknown) => {
      setDrawerState({ drawerVisible: true, formMode, drawerData, extendDrawerData })
    },
    [],
  )

  const closeDrawer = useCallback(() => {
    // 仅隐藏抽屉，保留 formMode / drawerData。
    // 若此处把 formMode 重置为 initialMode，antd Drawer（destroyOnHidden）在关闭动画期间
    // 仍挂载内容，会导致 mode 瞬间切回 create，引发隐藏字段（如值编码/值名称/状态）闪现。
    setDrawerState((prev) => ({ ...prev, drawerVisible: false }))
  }, [])

  return {
    ...drawerState,
    openDrawer,
    closeDrawer,
  }
}
