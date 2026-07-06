import { SorterResult } from 'antd/es/table/interface'

export function transPaginateParams<T extends Record<string, unknown>>(
  params: T,
): Omit<T, 'current'> & { page: number } {
  const { current = 1, ...others } = params
  return {
    ...others,
    page: current,
  } as unknown as Omit<T, 'current'> & { page: number }
}
export function formatSortParams(sorter: SorterResult | SorterResult[]): {
  sort?: Record<string, 'DESC' | 'ASC'>
} {
  if (!sorter) {
    return {}
  }
  return {
    sort: (Array.isArray(sorter) ? sorter : [sorter])
      .map((item) => {
        const fieldKey = Array.isArray(item.field) ? String(item.field[0]) : String(item.field)

        return {
          [fieldKey]: (item.order === 'descend' ? 'DESC' : 'ASC') as 'DESC' | 'ASC',
        }
      })
      .reduce((p, c) => ({ ...p, ...c }), {} as Record<string, 'DESC' | 'ASC'>),
  }
}
