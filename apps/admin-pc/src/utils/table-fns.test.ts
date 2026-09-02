import { describe, it, expect } from 'vitest'
import { formatSortParams } from './table-fns'

describe('formatSortParams', () => {
  it('sorter 为空时返回空对象', () => {
    expect(formatSortParams(undefined as any)).toEqual({})
    expect(formatSortParams(null as any)).toEqual({})
  })

  it('sorter 无 field 或 order 时返回空对象', () => {
    expect(formatSortParams({} as any)).toEqual({})
    expect(formatSortParams({ field: 'name' } as any)).toEqual({})
    expect(formatSortParams({ order: 'ascend' } as any)).toEqual({})
  })

  it('单 sorter：ascend / descend 映射', () => {
    expect(formatSortParams({ field: 'name', order: 'ascend' } as any)).toEqual({
      sort: { name: 'ASC' },
    })
    expect(formatSortParams({ field: 'age', order: 'descend' } as any)).toEqual({
      sort: { age: 'DESC' },
    })
  })

  it('field 为数组时取第一个元素', () => {
    expect(formatSortParams({ field: ['a', 'b'], order: 'descend' } as any)).toEqual({
      sort: { a: 'DESC' },
    })
  })

  it('多列排序时合并结果', () => {
    expect(
      formatSortParams([
        { field: 'a', order: 'ascend' },
        { field: 'b', order: 'descend' },
        { field: 'c' } as any,
      ] as any),
    ).toEqual({ sort: { a: 'ASC', b: 'DESC' } })
  })
})
