import { SmartFormEditMode } from '@/components/common'
import { useCallback, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDrawer = <T = any>(initialMode: SmartFormEditMode = 'create') => {
  const [drawerState, setDrawerState] = useState<{
    drawerVisible: boolean
    formMode: SmartFormEditMode
    drawerData?: T | number
  }>({
    drawerVisible: false,
    formMode: initialMode,
  })

  const openDrawer = useCallback((formMode: SmartFormEditMode, drawerData?: T | number) => {
    setDrawerState({ drawerVisible: true, formMode, drawerData })
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerState({ drawerVisible: false, formMode: initialMode })
  }, [initialMode])

  return {
    ...drawerState,
    openDrawer,
    closeDrawer,
  }
}
