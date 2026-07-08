import { SorterResult } from 'antd/es/table/interface'

export function formatSortParams(sorter: SorterResult | SorterResult[]): {
  sort?: Record<string, 'DESC' | 'ASC'>
} {
  if (!sorter) {
    return {}
  }
  const sorterList = Array.isArray(sorter) ? sorter : [sorter]
  const activeSorters = sorterList.filter((item) => item?.field && item?.order)
  if (activeSorters.length === 0) {
    return {}
  }
  return {
    sort: activeSorters
      .map((item) => {
        const fieldKey = Array.isArray(item.field) ? String(item.field[0]) : String(item.field)
        return {
          [fieldKey]: (item.order === 'descend' ? 'DESC' : 'ASC') as 'DESC' | 'ASC',
        }
      })
      .reduce((p, c) => ({ ...p, ...c }), {} as Record<string, 'DESC' | 'ASC'>),
  }
}
