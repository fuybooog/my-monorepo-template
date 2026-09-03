import { useMemo, useState } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode, ActionItem } from '@/components/common'
import { Backend } from '@repo/types'
import { UserFormContainer } from '../components/UserFormContainer'
import { userSearchSchema, getUserColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useUserList } from '../hooks/useUserList'
import { useUserExcel } from '../hooks/useUserExcel'
import userApi from '../api/user'
import { useAuthStore } from '@/store/authStore'
import { PERMISSIONS } from '@repo/shared'
import { ADMIN_USER_NAME } from '@/constants'
import { ResetPasswordDrawer } from '@/features/user/components/ResetPasswordDrawer'
import { AssignRolesDrawer } from '@/features/user/components/AssignRolesDrawer'

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

  const excel = useUserExcel(searchParams, refreshTable)

  const [form] = Form.useForm()
  const [resetVisible, setResetVisible] = useState<boolean>(false)
  const [assignRolesVisible, setAssignRolesVisible] = useState<boolean>(false)
  const [userId, setUserId] = useState<number | null>(null)

  const columns = useMemo(
    () =>
      getUserColumns({
        onNameClick(record) {
          openDrawer('view', record.id)
        },
        onStatusChange(record: Backend.UserPageRespDto, newStatus: string) {
          return updateUserStatus(record.id, newStatus)
        },
        async refreshList() {
          await refreshTable()
        },
      }),
    [openDrawer, refreshTable],
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

  const resetPasswordButton = (): ActionItem<Backend.UserPageRespDto> => {
    return {
      key: 'resetPassword',
      label: '重置密码',
      hidden() {
        return !useAuthStore.getState().hasPermission([PERMISSIONS.SYS_USER_LIST_RESET_PWD])
      },
      async onClick(record) {
        setUserId(record.id)
        setResetVisible(true)
      },
    }
  }
  const assignRolesButton = (): ActionItem<Backend.UserPageRespDto> => {
    return {
      key: 'assignRoles',
      label: '分配角色',
      hidden() {
        return !useAuthStore.getState().hasPermission([PERMISSIONS.SYS_USER_LIST_ASSIGN_ROLE])
      },
      async onClick(record) {
        setUserId(record.id)
        setAssignRolesVisible(true)
      },
    }
  }

  const deleteButton = (record: Backend.UserPageRespDto): ActionItem<Backend.UserPageRespDto> => ({
    key: 'delete',
    label: '删除',
    onClick: () => onDelete(record),
    permission: [PERMISSIONS.SYS_USER_LIST_DELETE],
  })

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
        rowSelection={{
          // 与行内删除一致,内置 admin 账号不可勾选删除（全选时也会自动排除）
          getCheckboxProps: (record: Backend.UserPageRespDto) => ({
            disabled: record.userName === ADMIN_USER_NAME,
          }),
        }}
        toolbar={{
          onCreate,
          onBatchDelete,
        }}
        excel={excel}
        actionColumn={{
          // 内置 admin 账号为系统账号,操作列所有操作(编辑/重置密码/分配角色/删除)均不展示
          buttons: (record) =>
            record.userName === ADMIN_USER_NAME
              ? []
              : ['edit', resetPasswordButton(), assignRolesButton(), deleteButton(record)],
          onEdit,
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
          closeDrawer={closeDrawer}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
      <ResetPasswordDrawer
        visible={resetVisible}
        onCancel={() => setResetVisible(false)}
        userId={userId!}
      ></ResetPasswordDrawer>
      <AssignRolesDrawer
        visible={assignRolesVisible}
        onCancel={() => setAssignRolesVisible(false)}
        userId={userId!}
      ></AssignRolesDrawer>
    </PageLayout>
  )
}
