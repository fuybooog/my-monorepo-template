// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { DatePicker } from 'antd'
import { createDateRangeItems } from './form-fns'

describe('createDateRangeItems', () => {
  it('生成开始/结束日期表单项（默认配置）', () => {
    const items = createDateRangeItems({ startDataIndex: 'beginTime', endDataIndex: 'endTime' })
    expect(Object.keys(items)).toEqual(['beginTime', 'endTime'])
    expect(items.beginTime.title).toBe('')
    expect(items.beginTime.widget).toBe(DatePicker)
    expect(items.beginTime.props.showTime).toBe(false)
    expect(items.beginTime.props.format.format).toBe('YYYY-MM-DD')
    // 两个字段共享同一份 props 配置
    expect(items.beginTime.props).toBe(items.endTime.props)
  })

  it('支持自定义标题与 showTime', () => {
    const items = createDateRangeItems({
      startDataIndex: 's',
      endDataIndex: 'e',
      startTitle: '开始时间',
      endTitle: '结束时间',
      showTime: true,
    })
    expect(items.s.title).toBe('开始时间')
    expect(items.e.title).toBe('结束时间')
    expect(items.s.props.showTime).toBe(true)
    expect(items.s.props.format.format).toBe('YYYY-MM-DD HH:mm:ss')
  })
})
