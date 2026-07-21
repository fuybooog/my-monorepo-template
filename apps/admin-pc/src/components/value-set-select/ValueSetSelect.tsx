import React, { memo } from 'react'
import { Select, SelectProps } from 'antd'
import { Backend } from '@repo/types'
import { useValueSet } from './useValueSet'

export interface ValueSetSelectProps extends Omit<SelectProps, 'options'> {
  setCode: string
}

const ValueSetSelect: React.FC<ValueSetSelectProps> = memo(({ setCode, ...restProps }) => {
  const { options, loading } = useValueSet<Backend.ValueSetPageRespDto>(setCode)

  return (
    <Select loading={loading} options={options} placeholder="请选择" allowClear {...restProps} />
  )
})

ValueSetSelect.displayName = 'ValueSetSelect'

export default ValueSetSelect
