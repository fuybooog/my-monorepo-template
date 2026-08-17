/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface DragHandleContextProps {
  attributes: React.HTMLAttributes<any>
  listeners: SyntheticListenerMap | undefined
}

export const DragHandleContext = createContext<DragHandleContextProps>({
  attributes: {},
  listeners: undefined,
})

interface SmartTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

export const SmartTableRow: React.FC<SmartTableRowProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5, zIndex: 9999 } : {}),
  }

  const contextValue = useMemo(() => ({ attributes, listeners }), [attributes, listeners])

  return (
    <DragHandleContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} />
    </DragHandleContext.Provider>
  )
}
