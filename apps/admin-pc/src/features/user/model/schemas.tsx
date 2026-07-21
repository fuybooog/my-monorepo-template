import { SmartSchema } from '@/components/common'
import { Input, Select } from 'antd'
import { defaultStatusList } from '@/constants'
import { createDateRangeItems } from '@/utils'
import ValueSetSelect from '@/components/value-set-select/ValueSetSelect'

export const userSearchSchema: SmartSchema = {
  userName: {
    title: '用户名',
    widget: Input,
  },
  mobile: {
    title: '手机号',
    widget: Input,
  },
  status: {
    title: '状态',
    widget: Select,
    props: {
      options: defaultStatusList,
    },
  },
  ...createDateRangeItems({
    startDataIndex: 'birthStart',
    endDataIndex: 'birthEnd',
    startTitle: '生日',
  }),
}

export const userFormSchema = {
  userName: {
    title: '用户名',
    widget: Input,
    itemProps: {
      rules: [{ required: true, message: '请输入用户名' }],
    },
  },
  mobile: {
    title: '手机号',
    widget: Input,
    itemProps: {
      rules: [{ pattern: /(^1\d{10}$)/, message: '手机号格式不正确' }],
    },
  },
  nickName: {
    title: '昵称',
    widget: Input,
    itemProps: {
      rules: [{ max: 20, message: '昵称长度不符合要求' }],
    },
  },
  gender: {
    title: '性别',
    widget: ValueSetSelect,
    props: {
      setCode: 'SYS_GENDER',
    },
  },
}
