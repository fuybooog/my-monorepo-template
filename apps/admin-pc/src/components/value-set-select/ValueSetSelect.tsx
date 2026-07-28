import React, { memo, useCallback, useEffect } from 'react'
import { Select, SelectProps, Form } from 'antd'
import { Backend } from '@repo/types'
import { useValueSet } from './useValueSet'

type SelectValue = string | number | (string | number)[] | null | undefined

export interface ValueSetSelectProps extends Omit<SelectProps, 'options'> {
  setCode: string
  actualNameField?: string
}

const ValueSetSelect: React.FC<ValueSetSelectProps> = memo(
  ({ setCode, actualNameField, ...restProps }) => {
    const { options, loading } = useValueSet<Backend.ValueSetPageRespDto>(setCode)
    const form = Form.useFormInstance()

    const updateFields = useCallback(
      (value: SelectValue) => {
        if (!form || !actualNameField) return

        if (Array.isArray(value)) {
          if (value.length > 0 && options.length > 0) {
            const labels = value
              .map((v) => options.find((item) => item.value === v)?.label)
              .filter(Boolean) as string[]
            form.setFieldsValue({ [actualNameField]: labels })
          } else {
            form.setFieldsValue({ [actualNameField]: [] })
          }
          return
        }

        if (value !== undefined && value !== null && options.length > 0) {
          const selected = options.find((item) => item.value === value)
          form.setFieldsValue({ [actualNameField]: selected?.label ?? undefined })
        } else {
          form.setFieldsValue({ [actualNameField]: undefined })
        }
      },
      [options, actualNameField, form],
    )

    useEffect(() => {
      if (restProps.value !== undefined && restProps.value !== null) {
        updateFields(restProps.value as SelectValue)
      }
    }, [restProps.value, options, updateFields])

    const handleChange: SelectProps['onChange'] = (selected, option) => {
      restProps.onChange?.(selected, option)
      updateFields(selected)
    }

    return (
      <Select
        loading={loading}
        options={options}
        placeholder="请选择"
        allowClear
        {...restProps}
        onChange={handleChange}
      />
    )
  },
)

ValueSetSelect.displayName = 'ValueSetSelect'

export default ValueSetSelect
