import React, { useState } from 'react'
import { Space, Button, Popconfirm } from 'antd'
import { DeleteOutlined, PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { SmartTableColumnSettings } from './SmartTableColumnSettings'
import { SmartTableToolbarProps } from './smart-types'
import { useAuthStore } from '@/store/authStore'
import { saveBlob } from '@/utils'
import { EXCEL_MESSAGE } from '@/constants'

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
  excel,
  onImportClick,
}: SmartTableToolbarProps<T>) {
  const hasSelected = selectedRowKeys.length > 0
  const [exportLoading, setExportLoading] = useState(false)

  // 导出/导入:需同时满足「已配置能力」与「权限」才展示按钮
  const canExport =
    !!excel?.exportData &&
    (!excel.exportPermission || useAuthStore.getState().hasPermission([excel.exportPermission]))
  const canImport =
    !!excel?.importFile &&
    (!excel.importPermission || useAuthStore.getState().hasPermission([excel.importPermission]))

  const handleExport = async () => {
    if (!excel?.exportData || exportLoading) return
    setExportLoading(true)
    try {
      const payload = await excel.exportData()
      if (payload) {
        saveBlob(payload.blob, payload.filename || EXCEL_MESSAGE.EXPORT_FILE_DEFAULT)
      }
    } catch (error) {
      console.error('导出失败', error)
    } finally {
      setExportLoading(false)
    }
  }

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
    export: canExport ? (
      <Button
        key="export"
        icon={<DownloadOutlined />}
        loading={exportLoading}
        onClick={handleExport}
      >
        {EXCEL_MESSAGE.EXPORT_BUTTON}
      </Button>
    ) : null,
    import: canImport ? (
      <Button key="import" icon={<UploadOutlined />} onClick={onImportClick}>
        {EXCEL_MESSAGE.IMPORT_BUTTON}
      </Button>
    ) : null,
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
