import React, { useState } from 'react'
import { Space, Tag, Popover, Button, Popconfirm, Tooltip, Typography, Dropdown } from 'antd'
import { EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { MetaTreeNode } from '@/utils'

const { Text } = Typography

interface MetaItemTagListProps {
  items?: MetaTreeNode[]
  color?: string // Tag 颜色
  maxCount?: number // 单元格内最多展示的个数，默认 3
  onEdit?: (item: MetaTreeNode) => void
  onDelete?: (item: MetaTreeNode) => void
}

export const MetaItemTagList: React.FC<MetaItemTagListProps> = ({
  items = [],
  color = 'orange',
  maxCount = 3,
  onEdit,
  onDelete,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false)

  if (!items || items.length === 0) {
    return <span style={{ color: '#ccc' }}>-</span>
  }

  const visibleItems = items.slice(0, maxCount)
  const hiddenCount = items.length - maxCount

  // 1. 生成单个外置 Tag 的 Dropdown 菜单项（适用于数量 <=3 时的直接操作）
  const getTagMenu = (item: MetaTreeNode): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑资源',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(item),
    },
    {
      key: 'delete',
      danger: true,
      label: (
        <Popconfirm
          title="确定删除此资源吗？"
          onConfirm={() => onDelete?.(item)}
          okText="确定"
          cancelText="取消"
        >
          <span style={{ display: 'block', width: '100%' }}>删除资源</span>
        </Popconfirm>
      ),
      icon: <DeleteOutlined />,
    },
  ]

  // 2. Popover 内部完整列表内容（适用于数量 >3 时的展开视图）
  const popoverContent = (
    <div style={{ maxWidth: 320, maxHeight: 280, overflowY: 'auto' }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 4px',
            borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          {/* 左侧：Tag名称 + 唯一编码 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflow: 'hidden',
              marginRight: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag color={color} style={{ marginRight: 0 }}>
                {item.label}
              </Tag>
            </div>
            {item.uniqueProp && (
              <Text
                type="secondary"
                style={{ fontSize: 12 }}
                ellipsis={{ tooltip: item.uniqueProp }}
              >
                {item.uniqueProp}
              </Text>
            )}
          </div>

          {/* 右侧：操作按钮组 */}
          <Space size={4} style={{ flexShrink: 0 }}>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setPopoverOpen(false)
                  onEdit?.(item)
                }}
              />
            </Tooltip>
            <Popconfirm
              title="确定删除此资源吗？"
              onConfirm={() => onDelete?.(item)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ))}
    </div>
  )

  return (
    <Space wrap size={[4, 4]} align="center">
      {/* 1. 表格内直接展示的 Tag（包裹 Dropdown，点击触发编辑/删除） */}
      {visibleItems.map((item) => (
        <Dropdown key={item.id} menu={{ items: getTagMenu(item) }} trigger={['click']}>
          <Tag color={color} style={{ marginInlineEnd: 0, cursor: 'pointer' }}>
            {item.label}
          </Tag>
        </Dropdown>
      ))}

      {/* 2. 超出数量展示 +N 更多按钮与 Popover 弹窗 */}
      {hiddenCount > 0 && (
        <Popover
          content={popoverContent}
          title={`全部资源 (${items.length})`}
          trigger="click"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          placement="bottomLeft"
        >
          <Button type="dashed" size="small" style={{ fontSize: 12, padding: '0 6px', height: 22 }}>
            +{hiddenCount} 更多 <EllipsisOutlined />
          </Button>
        </Popover>
      )}
    </Space>
  )
}
