/* eslint-disable @typescript-eslint/no-explicit-any */
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
