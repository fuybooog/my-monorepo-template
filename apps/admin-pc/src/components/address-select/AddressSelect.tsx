/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react'
import { Cascader } from 'antd'
import { getCascaderDataWithCode } from 'cn-division'
import type { DefaultOptionType } from 'antd/es/cascader'
import {
  AddressSelectProps,
  InternalCascaderValue,
  ReturnTypeMap,
  SelectedOptionsType,
} from './address-select-type'

// ============ 类型守卫 ============

function isCodeObject(obj: unknown): obj is { code: string; name?: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    typeof (obj as { code: unknown }).code === 'string'
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

// ============ 组件实现 ============

function AddressSelect<T extends keyof ReturnTypeMap = 'leaf'>(
  props: AddressSelectProps<T>,
): React.ReactElement {
  const {
    multiple = false,
    returnValueType = 'full',
    value: externalValue,
    defaultValue,
    onChange: externalOnChange,
    ...restProps
  } = props

  const options = useMemo(() => getCascaderDataWithCode(), [])

  // 构建 code -> 完整路径映射（options 类型为 DefaultOptionType[]）
  const pathMap = useMemo(() => {
    const map = new Map<string, string[]>()
    const traverse = (nodes: DefaultOptionType[], path: string[]) => {
      for (const node of nodes) {
        const code = node.value as string
        const currentPath = [...path, code]
        map.set(code, currentPath)
        if (node.children) {
          traverse(node.children as DefaultOptionType[], currentPath)
        }
      }
    }
    traverse(options, [])
    return map
  }, [options])

  // 归一化单个输入
  const normalizeSingle = (input: unknown): string[] => {
    if (input == null) return []

    if (typeof input === 'string') {
      const path = pathMap.get(input)
      return path ? [...path] : []
    }

    if (Array.isArray(input)) {
      if (input.length === 0) return []

      if (isStringArray(input)) {
        const last = input[input.length - 1]
        const path = pathMap.get(last)
        if (path && path.length === input.length && path.every((v, i) => v === input[i])) {
          return input
        }
        const foundPath = pathMap.get(last)
        return foundPath ? [...foundPath] : []
      }

      if (input.every((item) => isCodeObject(item))) {
        const codes = input.map((item) => (item as { code: string }).code).filter(Boolean)
        if (codes.length === 0) return []
        const lastCode = codes[codes.length - 1]
        const path = pathMap.get(lastCode)
        return path ? [...path] : []
      }

      return []
    }

    if (isCodeObject(input)) {
      const path = pathMap.get(input.code)
      return path ? [...path] : []
    }

    return []
  }

  const isControlled = externalValue !== undefined

  // 归一化外部值
  const normalizeValue = (val: unknown, mult: boolean): InternalCascaderValue => {
    if (val == null) {
      return mult ? [] : []
    }

    if (!mult) {
      return normalizeSingle(val)
    } else {
      if (!Array.isArray(val)) {
        return [normalizeSingle(val)]
      }
      const result: string[][] = []
      for (const item of val) {
        const normalized = normalizeSingle(item)
        if (normalized.length > 0) {
          result.push(normalized)
        }
      }
      return result
    }
  }

  // 受控模式：直接用 useMemo 计算值
  const controlledValue = useMemo(
    () => normalizeValue(externalValue, multiple),
    [externalValue, multiple, normalizeValue],
  )

  // 非受控模式：使用 useState 初始化
  const [internalValue, setInternalValue] = useState<InternalCascaderValue>(() =>
    normalizeValue(defaultValue, multiple),
  )

  // 最终使用的 cascader 值
  const cascaderValue = isControlled ? controlledValue : internalValue

  // 转换返回值
  const convertReturnValue = (
    internalVal: InternalCascaderValue,
    selectedOpts?: SelectedOptionsType | SelectedOptionsType[],
  ): unknown => {
    const convertSingle = (path: string[], opts?: SelectedOptionsType) => {
      if (returnValueType === 'leaf') {
        return path.length > 0 ? path[path.length - 1] : undefined
      } else if (returnValueType === 'path') {
        return path
      } else {
        // full
        if (opts && opts.length === path.length) {
          return opts.map((opt) => ({
            code: opt.value as string,
            name: opt.label as string,
          }))
        }
        return path
      }
    }

    if (!multiple) {
      return convertSingle(internalVal as string[], selectedOpts as SelectedOptionsType)
    } else {
      const paths = internalVal as string[][]
      const optsArray = selectedOpts as SelectedOptionsType[] | undefined
      return paths.map((path, index) => {
        const opts = optsArray && optsArray[index] ? optsArray[index] : undefined
        return convertSingle(path, opts)
      })
    }
  }

  const handleChange = (newValue: any, selectedOptions?: any) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    // 无论哪种模式，都调用外部 onChange
    if (externalOnChange) {
      const returnVal = convertReturnValue(newValue, selectedOptions)
      ;(externalOnChange as any)(returnVal, selectedOptions)
    }
  }

  return (
    <Cascader
      {...(restProps as any)}
      options={options}
      multiple={multiple}
      value={cascaderValue}
      onChange={handleChange}
    />
  )
}

AddressSelect.displayName = 'AddressSelect'

export default AddressSelect
