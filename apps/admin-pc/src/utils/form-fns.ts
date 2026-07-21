import { SmartSchema } from '@/components/common'
import { DatePicker } from 'antd'

/**
 * 快速生成成对的“开始时间/结束时间”表单项配置参数接口
 */
export interface DateRangeConfigOptions {
  /** 开始日期字段在表单中的提交键名（DataIndex） */
  startDataIndex: string
  /** 结束日期字段在表单中的提交键名（DataIndex） */
  endDataIndex: string
  /** 开始日期的表单 Label 文本，默认为 '开始日期' */
  startTitle?: string
  /** 结束日期的表单 Label 文本，默认为 '结束日期' */
  endTitle?: string
  /** 是否开启时分秒选择，默认为 false */
  showTime?: boolean
}

/**
 * 快速生成成对的“开始-结束”日期/时间选择器的表单配置项。
 * 解决了配置化表单中频繁手写双日期组件的冗余代码问题。
 *
 * @param options - 配置项对象
 * @returns 返回一个包含两个日期组件配置的对象，可直接解构合并到 SmartForm 的 items 中
 *
 * @example
 * const dateItems = createDateRangeItems({
 *   startDataIndex: 'beginTime',
 *   endDataIndex: 'endTime',
 *   showTime: true
 * });
 * // 结合到表单项中:
 * // const formItems = { ...dateItems, ...otherItems };
 */
export function createDateRangeItems(options: DateRangeConfigOptions): SmartSchema {
  const { startDataIndex, endDataIndex, startTitle = '', endTitle = '', showTime = false } = options

  // 提取出公共的 props 配置，避免冗余的解构代码
  const commonProps = {
    showTime: showTime,
    format: {
      format: showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
      type: 'mask',
    },
  }

  return {
    [startDataIndex]: {
      title: startTitle,
      widget: DatePicker,
      props: commonProps,
    },
    [endDataIndex]: {
      title: endTitle,
      widget: DatePicker,
      props: commonProps,
    },
  }
}
