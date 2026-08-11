import { useMemo, useState } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode, CustomAction } from '@/components/common'
import { Backend } from '@repo/types'
import { ResourceFormContainer } from '../components/ResourceFormContainer'
import { resourceSearchSchema, getResourceColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useResourceList } from '../hooks/useResourceList'
import userApi from '../api/resource'

const formTitleMap = { create: '新增资源', edit: '编辑资源', view: '资源详情' }
export function ResourceListPage() {
  const {
    searchParams,
    smartTable,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useResourceList()

  const {
    drawerVisible,
    formMode,
    openDrawer,
    closeDrawer,
    drawerData: currentId,
    extendDrawerData,
  } = useDrawer<Backend.ResourcePageRespDto>()

  const [isSub, setIsSub] = useState(false)

  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getResourceColumns({
        onStatusChange(record: Backend.ResourcePageRespDto, newStatus: string) {
          return updateResourceStatus(record.id, newStatus)
        },
        handleDeleteMeta(record) {
          console.log('handleDeleteMeta', record)
        },
        handleEditMeta(record) {
          console.log('handleEditMeta', record)
        },
        async refreshList() {
          console.log('refreshList')
          await refreshTable()
        },
      }),
    [openDrawer],
  )

  async function updateResourceStatus(id: number, newStatus: string) {
    return userApi.updateStatus(id, newStatus)
  }

  const onCreate = () => {
    setIsSub(false)
    handleOpenDrawer('create')
  }
  const onEdit = (record: Backend.ResourcePageRespDto) => {
    setIsSub(record.type !== '0')
    handleOpenDrawer('edit', record.id)
  }

  const handleOpenDrawer = (mode: SmartFormEditMode, id?: number) => {
    openDrawer(mode, id)
  }

  const createButton: CustomAction<Backend.ResourcePageRespDto> = {
    key: 'createSub',
    label: '创建子资源',
    onClick(record) {
      // 目录下可以创建目录，页面下无法创建目录
      console.log('创建', record)
      setIsSub(record.type !== '0')
      openDrawer('create', undefined, { parentUniqueProp: record.uniqueProp })
    },
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={resourceSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.ResourcePageRespDto>
        ref={smartTable}
        searchParams={searchParams}
        schema={resourceSearchSchema}
        request={handleFetchData}
        columns={columns}
        toolbar={{
          onCreate,
          onBatchDelete,
        }}
        actionColumn={{
          buttons: [createButton, 'edit', 'delete'],
          onEdit,
          onDelete,
        }}
        scroll={{ x: 'max-content' }}
        showPagination={false}
      />

      <Drawer
        title={formTitleMap[formMode]}
        open={drawerVisible}
        onClose={() => closeDrawer()}
        size={'large'}
        destroyOnHidden
      >
        <ResourceFormContainer
          id={currentId as number}
          mode={formMode}
          isSub={isSub}
          defaultValue={extendDrawerData}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
    </PageLayout>
  )
}
