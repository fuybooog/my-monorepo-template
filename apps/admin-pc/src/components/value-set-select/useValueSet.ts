import { useState, useEffect, startTransition } from 'react'
import valueSetApi from '@/features/value-set/api/value-set'
import { Backend } from '@repo/types'

export interface ValueSetOption<T = Backend.ValueSetPageRespDto> {
  label: string
  value: string | number
  raw: T
}

export const useValueSet = <T = Backend.ValueSetPageRespDto>(setCode: string) => {
  const [options, setOptions] = useState<ValueSetOption<T>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!setCode) {
      startTransition(() => {
        setLoading(false)
      })
      return
    }
    valueSetApi
      .getValueSetBySetCodes({ setCodes: setCode })
      .then((res) => {
        const formatted = (res.data.list || []).map((item) => ({
          value: item.code,
          label: item.name,
          raw: item as T,
        }))
        setOptions(formatted)
      })
      .finally(() => setLoading(false))
  }, [setCode])

  const getLabel = (value: string | number) => {
    return options.find((item) => item.value === value)?.label || value || '-'
  }

  const getItem = (value: string | number): T | undefined => {
    return options.find((item) => item.value === value)?.raw
  }

  return { options, loading, getLabel, getItem }
}
