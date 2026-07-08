import React from 'react'
import { Popover, Checkbox, Button, Tooltip } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { ColumnSettingsProps } from './smart-types'
import { getColumnKey } from './smart-utils'

export const SmartTableColumnSettings: React.FC<ColumnSettingsProps> = ({
  columns,
  checkedKeys,
  onCheckedKeysChange,
}) => {
  const content = (
    <div style={{ maxWidth: 200 }}>
      <Checkbox.Group
        value={checkedKeys}
        onChange={(vals) => onCheckedKeysChange(vals as React.Key[])}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {columns.map((col) => {
          const key = getColumnKey(col)
          return (
            <Checkbox key={key} value={key}>
              {col.title || '操作'}
            </Checkbox>
          )
        })}
      </Checkbox.Group>
    </div>
  )

  return (
    <Popover content={content} title="列展示设置" trigger="click" placement="bottomRight">
      <Tooltip title="表格设置">
        <Button icon={<SettingOutlined />} shape="circle" />
      </Tooltip>
    </Popover>
  )
}
