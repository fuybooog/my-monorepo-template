import { useEffect, useState } from 'react'

/** 待办优先级 */
export type TodoPriority = 'high' | 'medium' | 'low'

/** 待办项 */
export interface TodoItem {
  id: string
  title: string
  priority: TodoPriority
  done: boolean
}

const STORAGE_KEY_PREFIX = 'admin-pc:dashboard:todos'

/** 首次进入时的演示待办（仅本地存储，可增删改） */
const DEFAULT_TODOS: TodoItem[] = [
  { id: 'demo-1', title: '梳理本周需求评审清单', priority: 'high', done: false },
  { id: 'demo-2', title: '复核操作日志清理归档配置', priority: 'medium', done: false },
  { id: 'demo-3', title: '整理用户列表导出字段说明', priority: 'low', done: false },
]

function readStored(userId?: number): TodoItem[] {
  if (userId === undefined) return DEFAULT_TODOS
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${userId}`)
    if (raw) return JSON.parse(raw) as TodoItem[]
  } catch {
    // 本地数据异常时忽略，回退为演示数据
  }
  return DEFAULT_TODOS
}

/**
 * 我的待办（演示数据，仅保存在本地 localStorage，按登录用户隔离）
 */
export function useTodos(userId?: number) {
  const [todos, setTodos] = useState<TodoItem[]>(() => readStored(userId))

  useEffect(() => {
    if (userId === undefined) return
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}:${userId}`, JSON.stringify(todos))
    } catch {
      // 本地存储失败不影响页面使用
    }
  }, [userId, todos])

  const addTodo = (title: string, priority: TodoPriority = 'medium') => {
    const trimmed = title.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, priority, done: false },
    ])
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((item) => item.id !== id))
  }

  const clearDone = () => {
    setTodos((prev) => prev.filter((item) => !item.done))
  }

  const doneCount = todos.filter((item) => item.done).length

  return {
    todos,
    activeCount: todos.length - doneCount,
    doneCount,
    addTodo,
    toggleTodo,
    removeTodo,
    clearDone,
  }
}
