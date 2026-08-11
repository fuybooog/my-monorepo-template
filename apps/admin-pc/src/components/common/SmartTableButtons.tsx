import React, { useMemo } from 'react'
import { Space, Button, Dropdown, Popconfirm } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import type { ActionColumnConfig, CustomAction } from './smart-types'
import type { ButtonProps } from 'antd'

export interface SmartTableButtonsProps<RecordType> {
  record: RecordType
  actionColumn: ActionColumnConfig<RecordType>
}

export function SmartTableButtons<RecordType>(props: SmartTableButtonsProps<RecordType>) {
  const { record, actionColumn } = props
  const { buttons, onEdit, onDelete, onAction, maxVisible, moreText, moreIcon, moreDropdownProps } =
    actionColumn

  // 将预设按钮转为 CustomAction
  const allActions = useMemo<CustomAction<RecordType>[]>(() => {
    const result: CustomAction<RecordType>[] = []
    buttons.forEach((item) => {
      if (item === 'edit') {
        if (onEdit) {
          result.push({
            key: 'edit',
            label: '编辑',
            // icon: <EditOutlined />,
          })
        }
        return
      }
      if (item === 'delete') {
        if (onDelete) {
          result.push({
            key: 'delete',
            label: '删除',
            // icon: <DeleteOutlined />,
            danger: true,
          })
        }
        return
      }
      result.push(item as CustomAction<RecordType>)
    })
    return result
  }, [buttons, onEdit, onDelete])

  // 过滤隐藏
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (typeof action.hidden === 'function') return !action.hidden(record)
      return !action.hidden
    })
  }, [allActions, record])

  if (visibleActions.length === 0) return null

  const maxVisibleCount = maxVisible ?? visibleActions.length
  const showMore = visibleActions.length > maxVisibleCount
  const primaryActions = visibleActions.slice(0, maxVisibleCount)
  const moreActions = visibleActions.slice(maxVisibleCount)

  // 渲染单个按钮
  const renderButton = (action: CustomAction<RecordType>) => {
    // 1. 提取自定义字段，剩余作为原生按钮属性
    const { key, label, icon, disabled, hidden, onClick, ...nativeProps } = action

    // 2. 计算 disabled 值（可能是函数）
    const finalDisabled = typeof disabled === 'function' ? disabled(record) : disabled

    // 3. 合并按钮属性（自定义 buttonProps 如果有则合并，但更推荐直接在 action 上声明）
    // 这里我们不使用 buttonProps，而是将 action 展开作为 props，但排除我们提取的自定义字段
    const buttonNativeProps: ButtonProps = {
      ...nativeProps, // 继承的 ButtonProps 字段
      icon, // icon 保留
      disabled: finalDisabled,
      size: nativeProps.size || 'small', // 默认 small
      type: nativeProps.type || 'link',
    }

    // 4. 处理点击事件
    // 编辑按钮
    if (key === 'edit') {
      return (
        <Button type="link" {...buttonNativeProps} onClick={() => onEdit?.(record)}>
          {label}
        </Button>
      )
    }

    // 删除按钮（带 Popconfirm）
    if (key === 'delete' || action.danger) {
      return (
        <Popconfirm
          title={action.popTitle || '确认删除'}
          description={action.popDescription || '确定要删除该条数据吗？此操作不可撤销。'}
          onConfirm={() => onDelete?.(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger {...buttonNativeProps}>
            {label}
          </Button>
        </Popconfirm>
      )
    }

    // 自定义按钮
    const handleClick = () => {
      if (onClick) {
        onClick(record)
      } else {
        onAction?.(key, record)
      }
    }

    return (
      <Button {...buttonNativeProps} onClick={handleClick}>
        {label}
      </Button>
    )
  }

  // 渲染主按钮和更多菜单（同上）
  const primaryNodes = primaryActions.map((action) => (
    <span key={action.key}>{renderButton(action)}</span>
  ))

  let moreNode = null
  if (showMore) {
    const menuItems = moreActions.map((action) => ({
      key: action.key,
      label: renderButton(action),
    }))
    moreNode = (
      <Dropdown menu={{ items: menuItems }} trigger={['click']} {...moreDropdownProps}>
        <Button type="link" size="small" icon={moreIcon || <MoreOutlined />}>
          {moreText || '更多'}
        </Button>
      </Dropdown>
    )
  }

  return (
    <Space size="small">
      {primaryNodes}
      {moreNode}
    </Space>
  )
}
