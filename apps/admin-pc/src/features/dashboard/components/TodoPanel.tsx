import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Segmented,
  Select,
  Tag,
  Tooltip,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { getMessage } from '@/utils/antd-instance'
import { SUCCESS_MESSAGE, CONFIRM_MESSAGE } from '@/constants/message'
import type { TodoItem, TodoPriority } from '../hooks/useTodos'

interface TodoPanelProps {
  todos: TodoItem[]
  doneCount: number
  onAdd: (title: string, priority: TodoPriority) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onClearDone: () => void
}

const PRIORITY_META: Record<TodoPriority, { color: string; label: string }> = {
  high: { color: 'red', label: '紧急' },
  medium: { color: 'orange', label: '普通' },
  low: { color: 'default', label: '低' },
}

const PRIORITY_OPTIONS = [
  { value: 'high', label: '紧急' },
  { value: 'medium', label: '普通' },
  { value: 'low', label: '低' },
]

type FilterKey = 'all' | 'active' | 'done'

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' },
]

export function TodoPanel({
  todos,
  doneCount,
  onAdd,
  onToggle,
  onRemove,
  onClearDone,
}: TodoPanelProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [filter, setFilter] = useState<FilterKey>('all')

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((item) => !item.done)
    if (filter === 'done') return todos.filter((item) => item.done)
    return todos
  }, [todos, filter])

  const total = todos.length
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, priority)
    setTitle('')
    getMessage().success(SUCCESS_MESSAGE.TODO_ADDED)
  }

  const handleRemove = (id: string) => {
    onRemove(id)
    getMessage().success(SUCCESS_MESSAGE.TODO_DELETED)
  }

  const handleClearDone = () => {
    onClearDone()
    getMessage().success(SUCCESS_MESSAGE.TODO_CLEARED)
  }

  return (
    <Card
      variant="borderless"
      className="h-full shadow-sm"
      title="我的待办"
      extra={
        <Tag variant="filled" color="blue" className="text-xs">
          演示数据 · 仅保存在本机
        </Tag>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="输入待办内容，回车或点击添加"
          value={title}
          maxLength={50}
          allowClear
          onChange={(e) => setTitle(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Select
          className="w-full sm:w-28"
          value={priority}
          options={PRIORITY_OPTIONS}
          onChange={(value) => setPriority(value as TodoPriority)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          size="small"
          value={filter}
          options={FILTER_OPTIONS}
          onChange={(value) => setFilter(value as FilterKey)}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            已完成 {doneCount}/{total}
          </span>
          <Progress percent={percent} size="small" className="mb-0 w-24" />
          {doneCount > 0 && (
            <Popconfirm
              title={CONFIRM_MESSAGE.TODO_CLEAR_ALL}
              okText="确定"
              cancelText="取消"
              onConfirm={handleClearDone}
            >
              <Button size="small" danger type="text">
                清空已完成
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <Empty
          description={filter === 'done' ? '还没有完成的待办' : '暂无待办，先添加一条吧'}
          className="py-8"
        />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
          {filteredTodos.map((item) => {
            const meta = PRIORITY_META[item.priority]
            return (
              <li key={item.id} className="group flex items-center gap-3 py-2.5">
                <Checkbox
                  checked={item.done}
                  onChange={() => onToggle(item.id)}
                  className="shrink-0"
                />
                <span
                  className={`flex-1 break-all ${
                    item.done
                      ? 'text-slate-300 line-through dark:text-zinc-600'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {item.title}
                </span>
                <Tag color={meta.color} className="shrink-0">
                  {meta.label}
                </Tag>
                <Popconfirm
                  title={CONFIRM_MESSAGE.TODO_DELETE}
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => handleRemove(item.id)}
                >
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Tooltip>
                </Popconfirm>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
