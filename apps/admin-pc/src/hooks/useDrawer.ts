/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartFormEditMode } from '@/components/common'
import { useCallback, useState } from 'react'

export const useDrawer = <T = any>(initialMode: SmartFormEditMode = 'create') => {
  const [drawerState, setDrawerState] = useState<{
    drawerVisible: boolean
    formMode: SmartFormEditMode
    drawerData?: T | number
    extendDrawerData?: T | any
  }>({
    drawerVisible: false,
    formMode: initialMode,
  })

  const openDrawer = useCallback(
    (formMode: SmartFormEditMode, drawerData?: T | number, extendDrawerData?: T | any) => {
      setDrawerState({ drawerVisible: true, formMode, drawerData, extendDrawerData })
    },
    [],
  )

  const closeDrawer = useCallback(() => {
    setDrawerState({ drawerVisible: false, formMode: initialMode })
  }, [initialMode])

  return {
    ...drawerState,
    openDrawer,
    closeDrawer,
  }
}
