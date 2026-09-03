import { useMemo, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, CustomAction, SmartToolbarCustomAction } from '@/components/common'
import { useAuthStore } from '@/store/authStore'
import { PERMISSIONS } from '@repo/shared'
import { operationLogSearchSchema, getOperationLogColumns } from '../model'
import { useOperationLogList } from '../hooks/useOperationLogList'
import { useOperationLogExcel } from '../hooks/useOperationLogExcel'
import { OperationLogDetailDrawer } from '../components/OperationLogDetailDrawer'
import { OperationLogCleanModal } from '../components/OperationLogCleanModal'
import type { OperationLogPageRespDto } from '../types'

/** 日志页可配置动作：仅导出 + 清理（日志为审计数据，不做新增/编辑/删除） */
export function OperationLogListPage() {
  const { searchParams, smartTable, handleFetchData, searchTable, refreshTable } =
    useOperationLogList()

  const excel = useOperationLogExcel(searchParams)

  const [detailId, setDetailId] = useState<number>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [cleanOpen, setCleanOpen] = useState(false)

  const openDetail = (record: OperationLogPageRespDto) => {
    setDetailId(record.id)
    setDetailOpen(true)
  }

  const columns = useMemo(() => getOperationLogColumns({ onDetailClick: openDetail }), [])

  // 查看按钮：与后端 detail 接口的 LIST_VIEW 权限码保持一致
  const viewButton: CustomAction<OperationLogPageRespDto> = {
    key: 'view',
    label: '详情',
    permission: [PERMISSIONS.SYS_OPERATION_LOG_LIST_VIEW],
    onClick: openDetail,
  }

  const canClean = useAuthStore((state) =>
    state.hasPermission([PERMISSIONS.SYS_OPERATION_LOG_LIST_CLEAN]),
  )

  const cleanAction: SmartToolbarCustomAction<OperationLogPageRespDto> = {
    key: 'clean',
    label: '清理日志',
    danger: true,
    onClick: () => setCleanOpen(true),
  }

  const toolbarActions = useMemo(() => {
    const actions: (SmartToolbarCustomAction<OperationLogPageRespDto> | 'export')[] = ['export']
    if (canClean) actions.push(cleanAction)
    return actions
  }, [canClean])

  return (
    <PageLayout>
      <SmartForm
        schema={operationLogSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      />

      <SmartTable<OperationLogPageRespDto>
        ref={smartTable}
        searchParams={searchParams}
        schema={operationLogSearchSchema}
        request={handleFetchData}
        columns={columns}
        excel={excel}
        toolbar={{ actions: toolbarActions }}
        actionColumn={{ buttons: [viewButton] }}
        scroll={{ x: 'max-content' }}
      />

      <OperationLogDetailDrawer
        open={detailOpen}
        id={detailId}
        onClose={() => setDetailOpen(false)}
      />
      <OperationLogCleanModal
        open={cleanOpen}
        onClose={() => setCleanOpen(false)}
        onSuccess={refreshTable}
      />
    </PageLayout>
  )
}
