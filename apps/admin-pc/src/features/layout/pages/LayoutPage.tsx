import { Outlet } from 'react-router-dom'
import { LayoutTop } from '../components/LayoutTop'

export function LayoutPage() {
  return (
    <div>
      <LayoutTop></LayoutTop>
      <div>
        <div>侧边</div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
