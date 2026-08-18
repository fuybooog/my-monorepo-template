import { SmartSchema } from '@/components/common'
import { Select } from 'antd'
import { defaultStatusList } from '@/constants'

export const roleSearchSchema: SmartSchema = {
  roleName: {
    title: '角色名',
  },
  roleCode: {
    title: '角色编码',
  },
  status: {
    title: '状态',
    widget: Select,
    props: {
      options: defaultStatusList,
    },
  },
}

export const getRoleFormSchema = (): SmartSchema => {
  return {
    roleName: {
      title: '角色名',
      itemProps: {
        rules: [{ required: true, message: '请输入角色名' }],
      },
      colProps: { span: 12 },
    },
    roleCode: {
      title: '角色编码',
      itemProps: {
        rules: [{ required: true, message: '请输入角色编码' }],
      },
      colProps: { span: 12 },
    },
  }
}
