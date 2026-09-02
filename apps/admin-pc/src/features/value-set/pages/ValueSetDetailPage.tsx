import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Drawer, Form, Space } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode } from '@/components/common'
import { Backend } from '@repo/types'
import { valueSetSearchSchema, getValueSetValueColumns } from '../model'
import valueSetApi from '../api/value-set'
import { useDrawer } from '@/hooks/useDrawer'
import { ValueSetFormContainer } from '../components/ValueSetFormContainer'
import { useValueSetDetailList } from '../hooks/useValueSetDetailList'

const formTitleMap = { create: '新增值', edit: '编辑值', view: '值详情' }

export function ValueSetDetailPage() {
  const { setCode = '' } = useParams<{ setCode: string }>()
  const navigate = useNavigate()

  const {
    smartTable,
    searchParams,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useValueSetDetailList(setCode)

  const {
    drawerVisible,
    formMode,
    openDrawer,
    closeDrawer,
    drawerData: currentId,
  } = useDrawer<number>()

  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getValueSetValueColumns({
        async onStatusChange(record: Backend.ValueSetPageRespDto, newStatus: number) {
          return valueSetApi.updateStatus(record.id, newStatus)
        },
        async refreshList() {
          await refreshTable()
        },
      }),
    [refreshTable],
  )

  const onCreate = () => {
    openDrawer('create')
  }

  const onEdit = (record: Backend.ValueSetPageRespDto) => {
    openDrawer('edit', record.id)
  }

  return (
    <PageLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/value-set/list')}>返回列表</Button>
      </Space>

      <SmartForm
        form={form}
        schema={valueSetSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.ValueSetPageRespDto>
        ref={smartTable}
        searchParams={searchParams}
        schema={valueSetSearchSchema}
        request={handleFetchData}
        columns={columns}
        toolbar={{
          onCreate,
          onBatchDelete,
        }}
        actionColumn={{
          buttons: () => ['edit', 'delete'],
          onEdit,
          onDelete,
        }}
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        title={formTitleMap[formMode as SmartFormEditMode]}
        open={drawerVisible}
        onClose={() => closeDrawer()}
        size={'large'}
        destroyOnHidden
      >
        <ValueSetFormContainer
          id={currentId as number}
          mode={formMode as SmartFormEditMode}
          editTarget="value"
          closeDrawer={closeDrawer}
          presetValues={{ setCode, setName: searchParams.setName }}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
    </PageLayout>
  )
}
