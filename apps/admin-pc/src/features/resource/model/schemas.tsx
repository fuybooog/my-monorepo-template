import { SmartSchema } from '@/components/common'
import { Radio, Select } from 'antd'
import { defaultStatusList } from '@/constants'
import { menuResourceList, notInMenuList, typeList } from './model'

export const resourceSearchSchema: SmartSchema = {
  label: {
    title: '资源名称',
  },
  uniqueProp: {
    title: '唯一编码',
  },
  menuPath: {
    title: '菜单路径',
  },
  status: {
    title: '状态',
    widget: Select,
    props: {
      options: defaultStatusList,
    },
  },
  notInMenu: {
    title: '菜单资源',
    widget: Select,
    props: {
      options: menuResourceList,
    },
  },
}

export const getResourceFormSchema = (): SmartSchema => {
  return {
    label: {
      title: '资源名称',
      itemProps: {
        rules: [{ required: true, message: '请输入资源名称' }],
      },
    },
    uniqueProp: {
      title: '唯一编码',
      itemProps: {
        rules: [{ required: true, message: '请输入唯一编码' }],
      },
    },
    parentUniqueProp: {
      title: '唯一父编码',
    },
    type: {
      title: '类型',
      widget: Select,
      itemProps: {
        rules: [{ required: true, message: '请选择类型' }],
      },
      props: {
        options: typeList,
      },
    },
    menuPath: {
      title: '菜单路径',
      dependencyField: 'type',
      hideWhen: ['0', '2', '3'],
      requiredWhen: ['1'],
      itemProps: {
        rules: [{ pattern: /^\//, message: '必须以/开头' }],
      },
    },
    notInMenu: {
      title: '菜单是否隐藏',
      widget: Radio.Group,
      props: {
        options: notInMenuList,
      },
    },
    // sortNumber: {
    //   title: '排序号',
    //   widget: InputNumber,
    // },
  }
}
