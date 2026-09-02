import { describe, it, expect } from 'vitest'
import { cn } from './css'

describe('cn', () => {
  it('拼接多个类名', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('过滤 falsy 值', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b')
  })

  it('支持数组与对象形式', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
  })

  it('使用 twMerge 处理冲突类名', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
