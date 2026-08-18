import resourceApi from '@/features/resource/api/resource'
import { useEffect } from 'react'

export function LayoutAside() {
  useEffect(() => {
    async function fetchResource() {
      await resourceApi.listByUser()
      // console.log('fetchResource:res', res)
    }
    // 查询菜单数据
    fetchResource()
  })

  return <div>动态菜单</div>
}
