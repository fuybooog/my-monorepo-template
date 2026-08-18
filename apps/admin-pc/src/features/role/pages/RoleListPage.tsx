import { useMemo } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode } from '@/components/common'
import { Backend } from '@repo/types'
import { RoleFormContainer } from '../components/RoleFormContainer'
import { roleSearchSchema, getRoleColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useRoleList } from '../hooks/useRoleList'
import roleApi from '../api/role'

const formTitleMap = { create: '新增角色', edit: '编辑角色', view: '角色详情' }
export function RoleListPage() {
  const {
    searchParams,
    smartTable,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useRoleList()

  const { drawerVisible, formMode, openDrawer, closeDrawer, drawerData } =
    useDrawer<Backend.RolePageRespDto>()

  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getRoleColumns({
        onNameClick(record) {
          openDrawer('view', record)
        },
        onStatusChange(record: Backend.RolePageRespDto, newStatus: string) {
          return updateRoleStatus(record.id, newStatus)
        },
        async refreshList() {
          await refreshTable()
        },
      }),
    [openDrawer, refreshTable],
  )

  async function updateRoleStatus(id: number, newStatus: string) {
    return roleApi.updateStatus(id, newStatus)
  }

  const onCreate = () => {
    handleOpenDrawer('create')
  }
  const onEdit = (record: Backend.RolePageRespDto) => {
    handleOpenDrawer('edit', record)
  }

  const handleOpenDrawer = (mode: SmartFormEditMode, record?: Backend.RolePageRespDto) => {
    openDrawer(mode, record)
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={roleSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.RolePageRespDto>
        ref={smartTable}
        searchParams={searchParams}
        schema={roleSearchSchema}
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
        <RoleFormContainer
          drawerData={drawerData as Backend.RolePageRespDto}
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
