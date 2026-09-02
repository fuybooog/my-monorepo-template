import React, { useMemo } from 'react'
import { Space, Button, Dropdown, Popconfirm } from 'antd'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { ActionColumnConfig, ButtonPermissionObj, CustomAction } from './smart-types'
import type { ButtonProps } from 'antd'
import { useAuthStore } from '@/store/authStore'
import { CONFIRM_MESSAGE } from '@/constants'

export interface SmartTableButtonsProps<RecordType> {
  record: RecordType
  actionColumn: ActionColumnConfig<RecordType>
}

export function SmartTableButtons<RecordType>(props: SmartTableButtonsProps<RecordType>) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const { record, actionColumn } = props
  const {
    buttons,
    onEdit,
    onDelete,
    onAction,
    maxVisible,
    moreText,
    moreIcon,
    moreDropdownProps,
    onlyIcon = false,
    actionPermission,
  } = actionColumn

  // 将预设按钮转为 CustomAction
  const allActions = useMemo<CustomAction<RecordType>[]>(() => {
    const result: CustomAction<RecordType>[] = []
    const buttonResult = Array.isArray(buttons)
      ? buttons
      : typeof buttons === 'function'
        ? buttons(record)
        : []
    buttonResult.forEach((item) => {
      if (item === 'edit') {
        if (onEdit) {
          result.push({
            key: 'edit',
            ...(onlyIcon
              ? {
                  icon: <EditOutlined />,
                  label: '',
                  title: '编辑',
                }
              : {
                  label: '编辑',
                }),
            permission: actionPermission?.edit
              ? Array.isArray(actionPermission.edit)
                ? actionPermission.edit
                : actionPermission.edit.permission
              : [],
            permissionMode: (actionPermission?.edit as ButtonPermissionObj)?.permissionMode || 'OR',
          })
        }
        return
      }
      if (item === 'delete') {
        if (onDelete) {
          result.push({
            key: 'delete',
            danger: true,
            ...(onlyIcon
              ? {
                  icon: <DeleteOutlined />,
                  label: '',
                  title: '删除',
                }
              : {
                  label: '删除',
                }),
            permission: actionPermission?.delete
              ? Array.isArray(actionPermission.delete)
                ? actionPermission.delete
                : actionPermission.delete.permission
              : [],
            permissionMode:
              (actionPermission?.delete as ButtonPermissionObj)?.permissionMode || 'OR',
          })
        }
        return
      }
      result.push(item as CustomAction<RecordType>)
    })
    return result
  }, [buttons, onEdit, onDelete, onlyIcon, record, actionPermission])

  // 过滤隐藏
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (typeof action.hidden === 'function') return !action.hidden(record)
      if (action.permission?.length) {
        if (!hasPermission(action.permission, action.permissionMode || 'OR')) {
          return false
        }
      }
      return !action.hidden
    })
  }, [allActions, record, hasPermission])

  if (visibleActions.length === 0) return null

  const maxVisibleCount = maxVisible ?? visibleActions.length
  const showMore = visibleActions.length > maxVisibleCount
  const primaryActions = visibleActions.slice(0, maxVisibleCount)
  const moreActions = visibleActions.slice(maxVisibleCount)

  // 渲染单个按钮
  const renderButton = (action: CustomAction<RecordType>) => {
    // 1. 提取自定义字段，剩余作为原生按钮属性
    const {
      key,
      label,
      icon,
      disabled,
      hidden: _hidden,
      onClick,
      permissionMode,
      permission,
      ...nativeProps
    } = action

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
        <Button
          type="link"
          icon={<EditOutlined />}
          {...buttonNativeProps}
          onClick={() => (onClick || onEdit)?.(record)}
        >
          {onlyIcon ? '' : label}
        </Button>
      )
    }

    // 删除按钮（带 Popconfirm）
    if (key === 'delete' || action.danger) {
      return (
        <Popconfirm
          title={action.popTitle || '确认删除'}
          description={action.popDescription || CONFIRM_MESSAGE.DELETE_SINGLE}
          onConfirm={() => (onClick || onDelete)?.(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} {...buttonNativeProps}>
            {onlyIcon ? '' : label}
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
        <Button
          type="link"
          size="small"
          icon={moreIcon || <MoreOutlined />}
          title={moreText || '更多'}
        >
          {onlyIcon ? '' : moreText || '更多'}
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
