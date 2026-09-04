import { useAuthStore } from '@/store/authStore'
import { useTodos } from '../hooks/useTodos'
import { WelcomeBanner } from '../components/WelcomeBanner'
import { StatCards } from '../components/StatCards'
import { TodoPanel } from '../components/TodoPanel'
import { QuickAccess } from '../components/QuickAccess'

export function DashboardPage() {
  const auth = useAuthStore((state) => state.auth)
  const { todos, activeCount, doneCount, addTodo, toggleTodo, removeTodo, clearDone } = useTodos(
    auth?.id,
  )

  return (
    <div className="space-y-4">
      <WelcomeBanner />

      <StatCards
        activeCount={activeCount}
        doneCount={doneCount}
        totalCount={todos.length}
        permissionCount={auth?.permissions.length ?? 0}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TodoPanel
            todos={todos}
            doneCount={doneCount}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onRemove={removeTodo}
            onClearDone={clearDone}
          />
        </div>
        <QuickAccess />
      </div>
    </div>
  )
}
