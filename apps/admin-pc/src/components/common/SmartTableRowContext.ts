import React, { createContext } from 'react'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface DragHandleContextProps {
  attributes: React.HTMLAttributes<any>
  listeners: SyntheticListenerMap | undefined
}

export const DragHandleContext = createContext<DragHandleContextProps>({
  attributes: {},
  listeners: undefined,
})
