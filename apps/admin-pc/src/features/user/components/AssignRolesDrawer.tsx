import React, { useEffect } from 'react'
import { Drawer, Form } from 'antd'
import { SmartForm, SmartSchema } from '@/components/common'
import userApi from '../api/user'
import { getMessage } from '@/utils/antd-instance'
import { RoleSelect } from '@/components/remote-select/RoleSelect'

interface AssignRolesProps {
  visible: boolean
  onCancel: () => void
  userId: number
}

export const AssignRolesDrawer: React.FC<AssignRolesProps> = ({ visible, onCancel, userId }) => {
  const [form] = Form.useForm()
  const resetSchema: SmartSchema = {
    roles: {
      title: '角色',
      widget: RoleSelect,
    },
  }

  useEffect(() => {
    const init = async () => {
      const res = await userApi.findRolesByUserId(userId)
      if (res.head.errCode === 0) {
        form.setFieldsValue({
          roles: res.data.list || [],
        })
      }
    }
    if (visible) {
      init()
    }
  }, [visible, form, userId])

  const handleFinish = async (values: { roleIds: number[] }) => {
    // setLoading(true)
    try {
      // 调用API，将新密码和用户ID发送给后端
      await userApi.assignRolesToUser(userId, { roleIds: values.roleIds })
      getMessage().success('角色分配成功！')
      form.resetFields() // 成功后再次重置
      onCancel() // 关闭弹窗
    } catch (error) {
      console.error('角色分配失败，请重试', error)
      getMessage().error('角色分配失败，请重试')
    } finally {
      // setLoading(false)
    }
  }

  return (
    <Drawer
      title={'分配角色'}
      open={visible}
      onClose={() => onCancel()}
      size={'large'}
      destroyOnHidden
    >
      <SmartForm
        form={form}
        schema={resetSchema}
        grid={true}
        onFinish={handleFinish}
        colProps={{ span: 24 }}
        mode={'create'}
      ></SmartForm>
    </Drawer>
  )
}
