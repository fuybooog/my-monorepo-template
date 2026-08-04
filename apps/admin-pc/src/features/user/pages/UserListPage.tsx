import { useMemo } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode } from '@/components/common'
import { Backend } from '@repo/types'
import { UserFormContainer } from '../components/UserFormContainer'
import { userSearchSchema, getUserColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useUserList } from '../hooks/useUserList'
import userApi from '../api/user'

const formTitleMap = { create: '新增用户', edit: '编辑用户', view: '用户详情' }
export function UserListPage() {
  const {
    searchParams,
    smartTable,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useUserList()

  const {
    drawerVisible,
    formMode,
    openDrawer,
    closeDrawer,
    drawerData: currentId,
  } = useDrawer<Backend.UserPageRespDto>()

  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getUserColumns({
        onNameClick(record) {
          openDrawer('view', record.id)
        },
        onStatusChange(record: Backend.UserPageRespDto, newStatus: string) {
          console.log('onStatusChange', record, newStatus)
          return updateUserStatus(record.id, newStatus)
        },
        async refreshList() {
          console.log('refreshList')
          await refreshTable()
        },
      }),
    [openDrawer],
  )

  async function updateUserStatus(id: number, newStatus: string) {
    return userApi.updateStatus(id, newStatus)
  }

  const onCreate = () => {
    handleOpenDrawer('create')
  }
  const onEdit = (record: Backend.UserPageRespDto) => {
    handleOpenDrawer('edit', record.id)
  }

  const handleOpenDrawer = (mode: SmartFormEditMode, id?: number) => {
    openDrawer(mode, id)
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={userSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.UserPageRespDto>
        ref={smartTable}
        searchParams={searchParams}
        schema={userSearchSchema}
        request={handleFetchData}
        columns={columns}
        toolbar={{
          onCreate,
          onBatchDelete,
        }}
        actionColumn={{
          buttons: ['edit', 'delete'],
          onEdit,
          onDelete,
        }}
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        title={formTitleMap[formMode]}
        open={drawerVisible}
        onClose={() => closeDrawer()}
        size={'large'}
        destroyOnHidden
      >
        <UserFormContainer
          id={currentId as number}
          mode={formMode}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
    </PageLayout>
  )
}
