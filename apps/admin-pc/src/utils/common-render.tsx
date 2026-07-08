/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Tag } from 'antd'
import dayjs from 'dayjs'
import type { AnyObject } from 'antd/es/_util/type'

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

export interface StatusConfig {
  text: string
  color: string
}

const DEFAULT_STATUS_MAP: Record<string | number, StatusConfig> = {
  '1': { text: '启用', color: 'success' },
  '0': { text: '禁用', color: 'error' },
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
