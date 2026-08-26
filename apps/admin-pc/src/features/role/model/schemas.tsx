import { SmartSchema } from '@/components/common'
import { InputNumber, Select } from 'antd'
import { defaultStatusList } from '@/constants'
import { UserSelect } from '@/components/remote-select/UserSelect'
import ResourceTree from '../components/ResourceTree'

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
    level: {
      title: '角色等级',
      widget: InputNumber,
      itemProps: {
        rules: [{ required: true, message: '请输入角色等级' }],
      },
      colProps: { span: 12 },
    },
    userIds: {
      title: '选择人员',
      itemProps: {
        rules: [{ required: true, message: '请选择人员' }],
      },
      colProps: { span: 24 },
      widget: UserSelect,
    },
    resourceIds: {
      title: '选择资源',
      itemProps: {
        rules: [{ required: true, message: '请选择资源' }],
      },
      colProps: { span: 24 },
      widget: ResourceTree,
    },
  }
}
