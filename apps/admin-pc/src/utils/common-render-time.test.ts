// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { commonTimeRender } from './common-render-time'

describe('commonTimeRender', () => {
  it('直接渲染模式：有效时间按默认格式输出', () => {
    expect(commonTimeRender('2026-01-02 10:30:00', {}, 0)).toBe('2026-01-02 10:30:00')
  })

  it('直接渲染模式：空值返回 -', () => {
    expect(commonTimeRender(null, {}, 0)).toBe('-')
    expect(commonTimeRender('', {}, 0)).toBe('-')
    expect(commonTimeRender(undefined, {}, 0)).toBe('-')
  })

  it('生成器模式：返回绑定自定义格式的函数', () => {
    const render = commonTimeRender('YYYY-MM-DD')
    expect(typeof render).toBe('function')
    expect(render('2026-01-02 10:30:00', {}, 0)).toBe('2026-01-02')
  })

  it('生成器模式：空值与非法日期返回 -', () => {
    const render = commonTimeRender('YYYY-MM-DD')
    expect(render(null, {}, 0)).toBe('-')
    expect(render('not-a-date', {}, 0)).toBe('-')
  })
})
