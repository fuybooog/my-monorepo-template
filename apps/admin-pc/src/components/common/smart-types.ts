/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  FormItemProps,
  FormInstance,
  TableProps,
  FormProps,
  DropdownProps,
  ButtonProps,
} from 'antd'
import { ColumnType } from 'antd/es/table'

// form属

export type SmartFormItem<T extends React.ComponentType<any> = any> = {
  title: string
  itemProps?: Omit<FormItemProps, 'label' | 'name'>

  viewRender?: (value: any, record: any) => React.ReactNode

  hiddenModes?: SmartFormMode[]
} & (
  | { widget: T; props?: React.ComponentProps<T>; render?: never }
  | { widget?: never; props?: never; render: (form: FormInstance) => React.ReactNode }
)

export type SmartSchema = Record<string, SmartFormItem<any>>

export type SmartFormMode = 'query' | 'create' | 'edit' | 'view'
export type SmartFormEditMode = Exclude<SmartFormMode, 'query'>

export interface SmartFormExtraProps {
  // 表单结构
  schema: SmartSchema
  // 自定义插槽
  children?: React.ReactNode
  // 表单类型 默认 query
  mode?: SmartFormMode
  // 操作按钮，如果有children，会被children覆盖
  actionRender?: (form: FormInstance, mode: SmartFormMode) => React.ReactNode
  // 是否与地址栏url同步 默认true
  syncUrlParams?: boolean
  // 与地址栏url同步的解析函数
  urlParamsTransform?: (params: Record<string, unknown>) => Record<string, unknown>
  // 是否自动触发查询，查询场景：输入框清空，选择器触发变动（select,date等）
  autoSubmit?: boolean
}

export type SmartFormProps = Omit<FormProps, 'children'> & SmartFormExtraProps

// table属性

export interface LinkConfig<RecordType> {
  onClick?: (record: RecordType) => void // 自定义点击，若不提供则触发全局 onLinkClick
  target?: '_blank' | '_self'
}

export interface SmartColumnType<RecordType> extends ColumnType<RecordType> {
  link?: boolean | LinkConfig<RecordType>
}

interface BaseSmartTableProps<RecordType> {
  storageKey?: string // 开启本地列持久化存储的唯一 key
  toolbar?:
    | {
        actions?: (SmartToolbarBuiltInAction | SmartToolbarCustomAction<RecordType>)[]
        hideSettings?: boolean
        onCreate?: () => void
        onBatchDelete?: (keys: React.Key[], rows?: RecordType[]) => void
      }
    | false // 如果传 false 则彻底关闭工具栏
  // 是否使用默认排序规则
  defaultSort?: boolean
  // 首次渲染时是否自动查询
  autoSearch?: boolean
  // 表单schema
  schema?: SmartSchema
  actionColumn?: ActionColumnConfig<RecordType> | false
  onLinkClick?: (row: RecordType, columnKey: React.Key) => void
}

interface ImpureTableProps<RecordType> extends BaseSmartTableProps<RecordType> {
  pure?: false
  searchParams: Record<string, unknown>
  request: (
    params: { page: number; pageSize: number; [key: string]: any },
    sorter: any,
  ) => Promise<{ data: RecordType[]; total: number }>
}

interface PureTableProps<RecordType> extends BaseSmartTableProps<RecordType> {
  pure: true
  searchParams?: never
  request?: never
}

export type SmartTableExtraProps<RecordType> =
  | ImpureTableProps<RecordType>
  | PureTableProps<RecordType>

interface ColumnsTypeProps<RecordType> extends Omit<TableProps<RecordType>, 'columns'> {
  columns?: SmartColumnType<RecordType>[]
}

export type SmartTableProps<RecordType> = ColumnsTypeProps<RecordType> &
  SmartTableExtraProps<RecordType>

export interface SmartTableInstance {
  refresh: (resetPage?: boolean) => void
  clearSelection: () => void
}

// Toolbar 属性

export type SmartToolbarBuiltInAction =
  | 'create'
  | 'batchDelete'
  | 'export'
  | 'import'
  | 'clearSelection'

export interface SmartToolbarCustomAction<T = any> {
  key: string
  label: string
  type?: 'primary' | 'default' | 'dashed' | 'link'
  danger?: boolean
  // batch 表示这是一个批量操作按钮（没勾选时禁用/隐藏），normal 表示普通按钮
  actionType: 'normal' | 'batch'
  onClick: (selectedRowKeys: React.Key[], selectedRows: T[]) => void | Promise<void>
}

export interface SmartTableToolbarProps<T> {
  selectedRowKeys: React.Key[]
  selectedRows: T[]
  onClearSelection: () => void
  // 核心对外接口
  actions?: (SmartToolbarBuiltInAction | SmartToolbarCustomAction<T>)[]
  hideSettings?: boolean
  // 列控制相关
  rawColumns: any[]
  checkedKeys: any[]
  onCheckedKeysChange: (cols: any[]) => void
  storageKey?: string
  // 额外暴露出一些快捷操作
  onCreate?: () => void
  onBatchDelete?: (keys: React.Key[], rows?: T[]) => void
}

// columns属性
export interface ColumnSettingsProps {
  columns: any[]
  checkedKeys: any[]
  onCheckedKeysChange: (vals: React.Key[]) => void
}

// 预设按钮类型（支持字符串简写）
export type PresetAction = 'edit' | 'delete'

export interface CustomAction<RecordType> extends Omit<
  ButtonProps,
  'onClick' | 'disabled' | 'hidden'
> {
  key: string
  label: string
  icon?: React.ReactNode // 保留，与 ButtonProps.icon 类型一致
  disabled?: boolean | ((record: RecordType) => boolean) // 支持函数
  hidden?: boolean | ((record: RecordType) => boolean)
  onClick?: (record: RecordType) => void // 自定义 onClick，带 record
  popTitle?: string
  popDescription?: string
}

export type ActionItem<RecordType> = PresetAction | CustomAction<RecordType>

// 操作列配置：继承 ColumnType
export interface ActionColumnConfig<RecordType> extends ColumnType<RecordType> {
  buttons: ActionItem<RecordType>[]
  maxVisible?: number
  moreText?: string
  moreIcon?: React.ReactNode
  moreDropdownProps?: DropdownProps
  onEdit?: (record: RecordType) => void
  onDelete?: (record: RecordType) => void
  onAction?: (key: string, record: RecordType) => void
}
