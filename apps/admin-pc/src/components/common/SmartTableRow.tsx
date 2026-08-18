import React, { useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandleContext } from './SmartTableRowContext'

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
