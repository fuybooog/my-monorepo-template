import { getMessage } from '@/utils'
import { Switch } from 'antd'
import { useState } from 'react'
import { SUCCESS_MESSAGE } from '@/constants'

export function StatusSwitch<RecordType, StatusType>({
  value,
  record,
  activeVal,
  inactiveVal,
  onStatusChange,
  refreshList,
}: {
  value: StatusType
  record: RecordType
  activeVal: StatusType
  inactiveVal: StatusType
  onStatusChange: (record: RecordType, newStatus: StatusType) => Promise<void | unknown>
  refreshList?: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleChange = async (checked: boolean) => {
    const nextStatus = checked ? activeVal : inactiveVal
    setLoading(true)
    try {
      await onStatusChange(record, nextStatus)
      getMessage().success(SUCCESS_MESSAGE.STATUS_UPDATE)
      refreshList?.()
    } catch (error) {
      console.error('更新状态失败', error)
    } finally {
      setLoading(false)
    }
  }

  return <Switch checked={value === activeVal} loading={loading} onChange={handleChange} />
}
