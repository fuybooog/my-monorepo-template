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
        {actions.map((action) => {
          if (typeof action === 'string') return builtInActionsMap[action] || null

          const isBtnDisabled = action.actionType === 'batch' && !hasSelected
          return (
            <Button
              key={action.key}
              type={action.type || 'default'}
              danger={action.danger}
              disabled={isBtnDisabled}
              onClick={() => action.onClick(selectedRowKeys, selectedRows)}
            >
              {action.label}
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
