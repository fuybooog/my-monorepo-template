/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { message, Switch, Tag } from 'antd'
import dayjs from 'dayjs'
import type { AnyObject } from 'antd/es/_util/type'
import { DEFAULT_STATUS_MAP, StatusConfig } from '@/constants'

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * 表格时间列通用渲染函数 / 生成器
 *
 * @description 支持两种调用模式：
 * 1. **直接渲染模式**：不传格式，直接作为 Antd Table Column 的 `render` 属性，使用默认格式 `YYYY-MM-DD HH:mm:ss`。
 * 2. **自定义格式模式**：传入自定义格式字符串（如 `'YYYY-MM-DD'`），返回一个适用于 `render` 的新函数。
 *
 * @example
 * // 模式 1：直接作为 render 传参
 * { title: '创建时间', dataIndex: 'createTime', render: commonTimeRender }
 *
 * // 模式 2：生成自定义格式渲染函数
 * { title: '生日', dataIndex: 'birthday', render: commonTimeRender('YYYY-MM-DD') }
 */
export function commonTimeRender(
  format: string,
): (value: any, record: AnyObject, index: number) => string

export function commonTimeRender(value: any, record: AnyObject, index: number): string

export function commonTimeRender(
  formatOrValue?: any,
  record?: any,
  _index?: number,
): string | ((value: any, record: AnyObject, index: number) => string) {
  if (typeof formatOrValue === 'string' && (!record || typeof record !== 'object')) {
    const customFormat = formatOrValue
    return (value: any) => {
      if (!value) return '-'
      return dayjs(value).isValid() ? dayjs(value).format(customFormat) : '-'
    }
  }

  const value = formatOrValue
  if (!value) return '-'
  return dayjs(value).format(DEFAULT_FORMAT)
}

const DEFAULT_KEY = '0'

/**
 * 表格状态标签（Tag）通用渲染函数 / 生成器
 *
 * @description 封装了基于 Antd `Tag` 的状态展示，支持两种调用模式：
 * 1. **默认状态模式**：直接传入状态值，映射默认配置（`1` 为 启用/success，`0` 为 禁用/error）。
 * 2. **自定义配置模式**：传入自定义的映射字典，返回一个全新的、绑定了新配置的状态渲染函数。
 *
 * @example
 * // 模式 1：直接使用默认状态映射 (1 -> 启用, 0 -> 禁用)
 * { title: '状态', dataIndex: 'status', render: commonStatusRender }
 *
 * // 模式 2：传入自定义的状态映射字典
 * const auditMap = {
 *   'pending': { text: '待审核', color: 'warning' },
 *   'approved': { text: '已通过', color: 'success' },
 *   'rejected': { text: '已拒绝', color: 'error' }
 * };
 * { title: '审核状态', dataIndex: 'auditStatus', render: commonStatusRender(auditMap, 'pending') }
 */
export function commonStatusRender(status: string | number): React.ReactNode

export function commonStatusRender(
  customMap: Record<string | number, StatusConfig>,
  defaultKey?: string | number,
): (status: string | number) => React.ReactNode

export function commonStatusRender(
  mapOrStatus?: any,
  defaultKey: string | number = DEFAULT_KEY,
): any {
  if (mapOrStatus === null || mapOrStatus === undefined || typeof mapOrStatus !== 'object') {
    const targetKey = mapOrStatus ?? DEFAULT_KEY
    const current = DEFAULT_STATUS_MAP[targetKey] || DEFAULT_STATUS_MAP[DEFAULT_KEY]
    return <Tag color={current.color}>{current.text}</Tag>
  }

  const customMap = mapOrStatus
  const finalMap = { ...DEFAULT_STATUS_MAP, ...customMap }

  return (status: string | number) => {
    const targetKey = status ?? defaultKey
    const current = finalMap[targetKey] || finalMap[defaultKey]
    if (!current) return '-'
    return <Tag color={current.color}>{current.text}</Tag>
  }
}

// // 1. 定义状态项的类型结构
// export type StatusOption<T = any> = {
//   label?: string;
//   value: T;
// };

// export type StatusMapConfig<T = any> = [StatusOption<T> | T, StatusOption<T> | T];

// // 2. 渲染器参数接口
// export interface CreateStatusRenderOptions<RecordType = any, StatusType = any> {
//   statusMap?: StatusMapConfig<StatusType>;
//   onStatusChange: (record: RecordType, newStatus: StatusType) => Promise<void | unknown>;
//   refreshList?: () => void;
// }

// /**
//  * 通用状态 Switch 渲染器生成函数
//  */
// export function createStatusRender<RecordType extends object = any, StatusType = number | string | boolean>({
//   statusMap = [{ label: '启用', value: '1' }, { label: '禁用', value: '0' }] as StatusMapConfig<StatusType>,
//   onStatusChange,
//   refreshList,
// }: CreateStatusRenderOptions<RecordType, StatusType>) {

//   // 提取启用值与禁用值
//   const activeVal = typeof statusMap[0] === 'object' && statusMap[0] !== null && 'value' in statusMap[0]
//     ? statusMap[0].value
//     : (statusMap[0] as StatusType);

//   const inactiveVal = typeof statusMap[1] === 'object' && statusMap[1] !== null && 'value' in statusMap[1]
//     ? statusMap[1].value
//     : (statusMap[1] as StatusType);
//   return function StatusSwitch(value: StatusType, record: RecordType) {
//     const [loading, setLoading] = useState<boolean>(false);

//     const handleChange = async (checked: boolean) => {
//       const nextStatus = checked ? activeVal : inactiveVal;
//       setLoading(true);
//       try {
//         await onStatusChange(record, nextStatus);
//         message.success('状态更新成功');
//         refreshList?.();
//       } catch (error) {
//         // 请求失败自动保持原状
//         console.error('更新状态失败', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     return (
//       <Switch
//         checked={value === activeVal}
//         loading={loading}
//         onChange={handleChange}
//       />
//     );
//   };
// }

export type StatusOption<T = any> = { label?: string; value: T }
export type StatusMapConfig<T = any> = [StatusOption<T> | T, StatusOption<T> | T]

export interface CreateStatusRenderOptions<RecordType = any, StatusType = any> {
  statusMap?: StatusMapConfig<StatusType>
  onStatusChange: (record: RecordType, newStatus: StatusType) => Promise<void | unknown>
  refreshList?: () => void
}

// 内部真正的 React 状态组件
function InternalStatusSwitch<RecordType, StatusType>({
  value,
  record,
  activeVal,
  inactiveVal,
  onStatusChange,
  refreshList,
}: {
  value: StatusType
  record: RecordType
  activeVal: StatusType
  inactiveVal: StatusType
  onStatusChange: (record: RecordType, newStatus: StatusType) => Promise<void | unknown>
  refreshList?: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleChange = async (checked: boolean) => {
    const nextStatus = checked ? activeVal : inactiveVal
    setLoading(true)
    try {
      await onStatusChange(record, nextStatus)
      message.success('状态更新成功')
      refreshList?.()
    } catch (error) {
      console.error('更新状态失败', error)
    } finally {
      setLoading(false)
    }
  }

  return <Switch checked={value === activeVal} loading={loading} onChange={handleChange} />
}

/**
 * 状态 Switch 渲染高阶函数
 */
export function createStatusRender<RecordType extends object = any, StatusType = any>({
  statusMap = ['1', '0'] as StatusMapConfig<StatusType>,
  onStatusChange,
  refreshList,
}: CreateStatusRenderOptions<RecordType, StatusType>) {
  // 解析状态的 active / inactive 值
  const activeVal =
    typeof statusMap[0] === 'object' && statusMap[0] !== null && 'value' in statusMap[0]
      ? statusMap[0].value
      : (statusMap[0] as StatusType)

  const inactiveVal =
    typeof statusMap[1] === 'object' && statusMap[1] !== null && 'value' in statusMap[1]
      ? statusMap[1].value
      : (statusMap[1] as StatusType)

  // 返回符合 antd render 签名的普通函数 (value, record) => ReactNode
  return (value: StatusType, record: RecordType) => {
    // 💡 关键：使用 React.createElement 挂载子组件，从而安全使用内部 Hooks
    return React.createElement(InternalStatusSwitch<RecordType, StatusType>, {
      value,
      record,
      activeVal,
      inactiveVal,
      onStatusChange,
      refreshList,
    })
  }
}
