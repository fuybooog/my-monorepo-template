import { CascaderProps } from 'antd'
import { DefaultOptionType } from 'antd/es/select'

export type LeafReturn = string
export type PathReturn = string[]
export type FullReturn = Array<{ code: string; name: string }>

export type ReturnTypeMap = {
  leaf: LeafReturn
  path: PathReturn
  full: FullReturn
}

export type ReturnTypeMapMulti = {
  leaf: LeafReturn[]
  path: PathReturn[]
  full: FullReturn[]
}

export type SingleInput =
  | string
  | string[]
  | { code: string; name?: string }
  | Array<{ code: string; name?: string }>
  | null
  | undefined

export type MultiInput = SingleInput[] | null | undefined

export type InternalCascaderValue = string[] | string[][]

// 从 CascaderProps 中提取 onChange 的 selectedOptions 类型
export type SelectedOptionsType = NonNullable<Parameters<NonNullable<CascaderProps['onChange']>>[1]>

// ============ 组件 Props ============

export type BaseCascaderProps = Omit<
  CascaderProps<DefaultOptionType>,
  'value' | 'onChange' | 'multiple' | 'options' | 'defaultValue'
>

export interface SingleAddressSelectProps<
  T extends keyof ReturnTypeMap = 'leaf',
> extends BaseCascaderProps {
  multiple?: false
  returnValueType?: T
  value?: SingleInput
  defaultValue?: SingleInput
  onChange?: (value: ReturnTypeMap[T], selectedOptions?: SelectedOptionsType) => void
}

export interface MultiAddressSelectProps<
  T extends keyof ReturnTypeMap = 'leaf',
> extends BaseCascaderProps {
  multiple: true
  returnValueType?: T
  value?: MultiInput
  defaultValue?: MultiInput
  onChange?: (value: ReturnTypeMapMulti[T], selectedOptions?: SelectedOptionsType[]) => void
}

export type AddressSelectProps<T extends keyof ReturnTypeMap = 'leaf'> =
  | SingleAddressSelectProps<T>
  | MultiAddressSelectProps<T>
