import React from 'react'
import { Space, Button, Popconfirm } from 'antd'
import { DeleteOutlined, PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { SmartTableColumnSettings } from './SmartTableColumnSettings'
import { SmartTableToolbarProps } from './smart-types'

export function SmartTableToolbar<T>({
  selectedRowKeys,
  selectedRows,
  onClearSelection,
  actions = ['create', 'batchDelete', 'export', 'import', 'clearSelection'],
  additionalActions = [],
  hideSettings = false,
  rawColumns,
  checkedKeys,
  onCheckedKeysChange,
  onCreate,
  onBatchDelete,
}: SmartTableToolbarProps<T>) {
  const hasSelected = selectedRowKeys.length > 0

  const builtInActionsMap: Record<string, React.ReactNode> = {
    create: (
      <Button key="create" type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        新建
      </Button>
    ),
    batchDelete: (
      <Popconfirm
        key="batchDelete"
        title={`确定要删除这 ${selectedRowKeys.length} 项吗？`}
        disabled={!hasSelected}
        onConfirm={() => onBatchDelete?.(selectedRowKeys, selectedRows)}
      >
        <Button danger type="primary" icon={<DeleteOutlined />} disabled={!hasSelected}>
          批量删除
        </Button>
      </Popconfirm>
    ),
    export: (
      <Button key="export" icon={<DownloadOutlined />}>
        导出
      </Button>
    ),
    import: (
      <Button key="import" icon={<UploadOutlined />}>
        导入
      </Button>
    ),
    clearSelection: hasSelected ? (
      <Button
        key="clearSelection"
        type="link"
        onClick={onClearSelection}
        style={{ paddingLeft: 0 }}
      >
        取消选中 ({selectedRowKeys.length})
      </Button>
    ) : null,
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Space wrap>
        {[...actions, ...additionalActions].map((action) => {
          if (typeof action === 'string') return builtInActionsMap[action] || null
          const { key, label, actionType, onClick, ...buttonProps } = action

          const isBtnDisabled = actionType === 'batch' && !hasSelected

          return (
            <Button
              key={key}
              {...buttonProps}
              disabled={isBtnDisabled}
              onClick={() => onClick(selectedRowKeys, selectedRows)}
            >
              {label}
            </Button>
          )
        })}
      </Space>

      {!hideSettings && (
        <SmartTableColumnSettings
          columns={rawColumns}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={onCheckedKeysChange}
        />
      )}
    </div>
  )
}
