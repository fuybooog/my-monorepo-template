import { Outlet } from 'react-router-dom'
import { LayoutTop } from '../components/LayoutTop'
import { LayoutAside } from '../components/LayoutAside'

export function LayoutPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100">
      <header className="h-16 flex-none bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 z-10">
        <LayoutTop />
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-60 flex-none bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800/80 overflow-y-auto p-4">
          <LayoutAside />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 dark:bg-zinc-950">
          <div className="p-4 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
