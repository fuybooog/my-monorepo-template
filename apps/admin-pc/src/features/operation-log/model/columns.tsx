import { SmartColumnType } from '@/components/common'
import { Tag, Tooltip } from 'antd'
import { commonTimeRender } from '@/utils'
import { useAuthStore } from '@/store/authStore'
import { PERMISSIONS } from '@repo/shared'
import type { OperationLogPageRespDto } from '../types'

/** 级别 Tag 配色：1-信息 2-警告 3-错误 */
const LEVEL_TAG_COLOR: Record<number, string> = {
  1: 'blue',
  2: 'orange',
  3: 'red',
}

export const getOperationLogColumns = (callbacks: {
  onDetailClick: (record: OperationLogPageRespDto) => void
}): SmartColumnType<OperationLogPageRespDto>[] => {
  const { onDetailClick } = callbacks

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      sorter: { multiple: 2 },
      render: commonTimeRender,
    },
    {
      title: '级别',
      dataIndex: 'logLevel',
      width: 90,
      filters: [
        { text: '信息', value: 1 },
        { text: '警告', value: 2 },
        { text: '错误', value: 3 },
      ],
      render: (_, record) => (
        <Tag color={LEVEL_TAG_COLOR[record.logLevel] ?? 'default'}>{record.logLevelText}</Tag>
      ),
    },
    {
      title: '业务模块',
      dataIndex: 'moduleText',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'operationText',
      width: 100,
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 120,
    },
    {
      title: '操作人IP',
      dataIndex: 'operatorIp',
      width: 140,
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: '业务对象',
      dataIndex: 'businessText',
      width: 220,
      ellipsis: { showTitle: true },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: { showTitle: true },
      render: (value: string, record) => {
        // 摘要链接与详情抽屉共用后端 detail 接口（LIST_VIEW 权限），无权限时退化为纯文本
        const canView = useAuthStore
          .getState()
          .hasPermission([PERMISSIONS.SYS_OPERATION_LOG_LIST_VIEW])
        if (!canView) {
          return <span style={{ whiteSpace: 'pre-wrap' }}>{value}</span>
        }
        return (
          <Tooltip title={value}>
            <a onClick={() => onDetailClick(record)} style={{ whiteSpace: 'pre-wrap' }}>
              {value}
            </a>
          </Tooltip>
        )
      },
    },
  ]
}
