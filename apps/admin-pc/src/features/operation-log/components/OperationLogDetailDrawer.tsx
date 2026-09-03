import { useEffect, useState } from 'react'
import { Descriptions, Drawer, Empty, Skeleton, Table, Tag } from 'antd'
import { PERMISSIONS } from '@repo/shared'
import { commonTimeRender } from '@/utils'
import operationLogApi from '../api/operation-log'
import type { OperationLogDetailRespDto } from '../types'

const LEVEL_TAG_COLOR: Record<number, string> = {
  1: 'blue',
  2: 'orange',
  3: 'red',
}

export function OperationLogDetailDrawer(props: {
  open: boolean
  /** 日志 id；切换 id 时自动重新拉取 */
  id?: number
  onClose: () => void
}) {
  const { open, id, onClose } = props
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<OperationLogDetailRespDto | null>(null)

  useEffect(() => {
    if (!open || id === undefined) {
      setDetail(null)
      return
    }
    setLoading(true)
    operationLogApi
      .findById(id)
      .then((res) => setDetail(res.data))
      .finally(() => setLoading(false))
  }, [open, id])

  return (
    <Drawer title="操作日志详情" open={open} onClose={onClose} width={720} destroyOnHidden>
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : detail ? (
        <>
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              {
                key: 'id',
                label: 'ID',
                children: detail.id,
              },
              {
                key: 'level',
                label: '级别',
                children: (
                  <Tag color={LEVEL_TAG_COLOR[detail.logLevel] ?? 'default'}>
                    {detail.logLevelText}
                  </Tag>
                ),
              },
              {
                key: 'createdAt',
                label: '操作时间',
                children: detail.createdAt ? commonTimeRender(detail.createdAt, {}, 0) : '-',
              },
              {
                key: 'module',
                label: '业务模块',
                children: detail.moduleText,
              },
              {
                key: 'operation',
                label: '操作',
                children: detail.operationText,
              },
              {
                key: 'business',
                label: '业务对象',
                children: detail.businessText,
              },
              {
                key: 'operator',
                label: '操作人',
                children: `${detail.operatorName}${
                  detail.operatorName !== '系统' ? `（id: ${detail.operatorId}）` : ''
                }`,
              },
              {
                key: 'operatorIp',
                label: '操作人IP',
                children: detail.operatorIp || '-',
              },
              {
                key: 'request',
                label: '请求',
                span: 2,
                children: detail.requestUri
                  ? `${detail.requestMethod ?? ''} ${detail.requestUri}`
                  : '-',
              },
              {
                key: 'summary',
                label: '摘要',
                span: 2,
                children: detail.summary,
              },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            <Table<{ field: string; fieldText: string; oldText: string; newText: string }>
              rowKey={(row, index) => `${row.field}-${index}`}
              size="small"
              pagination={false}
              dataSource={
                detail.detailJson?.map((change) => ({
                  field: change.field,
                  fieldText: change.fieldText,
                  oldText: change.oldText,
                  newText: change.newText,
                })) ?? []
              }
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无字段级变更记录" />
                ),
              }}
              columns={[
                { title: '变更字段', dataIndex: 'fieldText', width: 140 },
                {
                  title: '旧值',
                  dataIndex: 'oldText',
                  ellipsis: { showTitle: true },
                  render: (value: string) => (value === '' ? '-' : value),
                },
                {
                  title: '新值',
                  dataIndex: 'newText',
                  ellipsis: { showTitle: true },
                  render: (value: string) =>
                    value === '' ? (
                      '-'
                    ) : (
                      <span style={{ color: '#1677ff', fontWeight: 500 }}>{value}</span>
                    ),
                },
              ]}
            />
          </div>
        </>
      ) : (
        <Empty description="日志不存在或已被清理" />
      )}
    </Drawer>
  )
}

/** 详情查看权限码（供操作列按钮使用） */
export const OPERATION_LOG_VIEW_PERMISSION = PERMISSIONS.SYS_OPERATION_LOG_LIST_VIEW
