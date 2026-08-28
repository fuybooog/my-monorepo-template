import { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/router/ProtectedRoute'

export function createRoutesFromConfig(routeConfig: RouteObject[]): RouteObject[] {
  const routeList = routeConfig.map((config: RouteObject & { permission?: string[] }) => {
    const { permission, ...rest } = config
    const route: RouteObject = {
      ...rest,
    }

    // 若有权限要求，用 ProtectedRoute 包裹组件
    if (permission) {
      route.element = <ProtectedRoute permission={permission}>{config.element}</ProtectedRoute>
    } else {
      route.element = config.element
    }

    // 递归处理子路由
    if (config.children) {
      route.children = createRoutesFromConfig(config.children)
    }

    return route
  })
  return routeList as RouteObject[]
}
