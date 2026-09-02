// @ts-nocheck
import { describe, it, expect, vi, afterEach } from 'vitest'
import dayjs from 'dayjs'
import {
  getDictLabel,
  transformDateFieldsValue,
  filterObjectKeys,
  generateStrongPassword,
} from './fns'

describe('getDictLabel', () => {
  const dictList = [
    { id: 1, name: '启用' },
    { id: 0, name: '禁用' },
    { id: 'x', name: '字符串键' },
  ]

  it('命中时返回对应文本', () => {
    expect(getDictLabel(dictList, 1)).toBe('启用')
    expect(getDictLabel(dictList, 0)).toBe('禁用')
  })

  it('未命中时安全返回原值', () => {
    expect(getDictLabel(dictList, 99)).toBe(99)
  })

  it('字典列表为空或非数组时返回原值', () => {
    expect(getDictLabel([], 1)).toBe(1)
    expect(getDictLabel(null as any, 1)).toBe(1)
    expect(getDictLabel(undefined as any, 1)).toBe(1)
    expect(getDictLabel({} as any, 1)).toBe(1)
  })

  it('targetValue 为 null/undefined 时返回原值', () => {
    expect(getDictLabel(dictList, null as any)).toBe(null)
    expect(getDictLabel(dictList, undefined as any)).toBe(undefined)
  })

  it('支持自定义 matchKey 与 resultKey', () => {
    const list = [{ code: 'A', label: 'Alpha' }]
    expect(getDictLabel(list, 'A', 'code', 'label')).toBe('Alpha')
  })

  it('使用严格相等，字符串与数字不互相匹配', () => {
    expect(getDictLabel(dictList, '1')).toBe('1')
  })

  it('遍历项非法时不抛异常', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const list = [{ id: 1, name: 'ok' }, null as any, 'bad' as any]
    expect(getDictLabel(list as any, 1)).toBe('ok')
    spy.mockRestore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

describe('transformDateFieldsValue', () => {
  it('将合法日期转为 dayjs 对象', () => {
    const result = transformDateFieldsValue({ beginTime: '2026-01-02 10:00:00' }, ['beginTime'])
    expect(dayjs.isDayjs(result.beginTime)).toBe(true)
    expect(result.beginTime.isSame(dayjs('2026-01-02 10:00:00'))).toBe(true)
  })

  it('空值与非法日期统一转为 null', () => {
    const result = transformDateFieldsValue({ a: '', b: null, c: undefined, d: 'not-a-date' }, [
      'a',
      'b',
      'c',
      'd',
    ])
    expect(result.a).toBeNull()
    expect(result.b).toBeNull()
    expect(result.c).toBeNull()
    expect(result.d).toBeNull()
  })

  it('dateFields 为空时原样返回', () => {
    const values = { a: '2026-01-01' }
    expect(transformDateFieldsValue(values, [])).toBe(values)
  })

  it('不修改原对象', () => {
    const values = { beginTime: '2026-01-02' }
    const result = transformDateFieldsValue(values, ['beginTime'])
    expect(values.beginTime).toBe('2026-01-02')
    expect(result).not.toBe(values)
  })
})

describe('filterObjectKeys', () => {
  it('默认 include 模式：仅保留指定键', () => {
    expect(filterObjectKeys({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })

  it('exclude 模式：剔除指定键', () => {
    expect(
      filterObjectKeys({ a: 1, b: 2, c: 3 }, ['b'], { exclude: true, include: false }),
    ).toEqual({
      a: 1,
      c: 3,
    })
  })

  it('include 与 exclude 冲突时抛错或返回 null', () => {
    const options = { include: true, exclude: true } as any
    expect(() => filterObjectKeys({ a: 1 }, ['a'], { ...options, throwOnConflict: true })).toThrow()
    expect(filterObjectKeys({ a: 1 }, ['a'], options)).toBeNull()
  })

  it('支持剔除 undefined / null 值', () => {
    const source = { a: undefined, b: null, c: 0 }
    expect(filterObjectKeys(source, ['a', 'b', 'c'], { ignoreUndefined: true })).toEqual({
      b: null,
      c: 0,
    })
    expect(filterObjectKeys(source, ['a', 'b', 'c'], { ignoreNull: true })).toEqual({
      a: undefined,
      c: 0,
    })
  })

  it('非法 source 返回空对象', () => {
    expect(filterObjectKeys(null, ['a'])).toEqual({})
    expect(filterObjectKeys('str' as any, ['a'])).toEqual({})
    expect(filterObjectKeys(42 as any, ['a'])).toEqual({})
  })
})

describe('generateStrongPassword', () => {
  it('默认生成长度为 12 的密码', () => {
    const pw = generateStrongPassword()
    expect(pw).toHaveLength(12)
  })

  it('长度低于 8 时自动提升到 8', () => {
    expect(generateStrongPassword(4)).toHaveLength(8)
  })

  it('密码包含全部四类字符', () => {
    const pw = generateStrongPassword(20)
    expect(pw).toMatch(/[a-z]/)
    expect(pw).toMatch(/[A-Z]/)
    expect(pw).toMatch(/[0-9]/)
    expect(pw).toMatch(/[@$!%*?&#]/)
  })
})
