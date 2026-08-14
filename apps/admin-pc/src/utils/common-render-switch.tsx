/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { StatusSwitch } from '@/components/status-switch/StatusSwitch'
export type StatusOption<T = any> = { label?: string; value: T }
export type StatusMapConfig<T = any> = [StatusOption<T> | T, StatusOption<T> | T]

export interface CreateStatusRenderOptions<RecordType = any, StatusType = any> {
  statusMap?: StatusMapConfig<StatusType>
  onStatusChange: (record: RecordType, newStatus: StatusType) => Promise<void | unknown>
  refreshList?: () => void
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
    return React.createElement(StatusSwitch<RecordType, StatusType>, {
      value,
      record,
      activeVal,
      inactiveVal,
      onStatusChange,
      refreshList,
    })
  }
}
