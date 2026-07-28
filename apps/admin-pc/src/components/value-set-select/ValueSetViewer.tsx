import React from 'react'
import { useValueSet } from './useValueSet'

/** 专门用于 View 模式下的 ValueSet 值展示 */
export const ValueSetViewer: React.FC<{ setCode: string; value: string }> = ({
  setCode,
  value,
}) => {
  const { options, loading } = useValueSet(setCode)

  if (loading) return <span>加载中...</span>
  if (value === undefined || value === null || value === '') return <span>-</span>

  const valArray = Array.isArray(value) ? value : [value]
  const labels = valArray
    .map((val) => {
      const matched = options?.find((opt) => String(opt.value) === String(val))
      return matched ? matched.label : val
    })
    .join(', ')

  return <span>{labels || '-'}</span>
}
ValueSetViewer.displayName = 'ValueSetViewer'
