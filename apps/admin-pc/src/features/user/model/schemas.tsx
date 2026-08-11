import { SmartSchema } from '@/components/common'
import { DatePicker, Select } from 'antd'
import { defaultStatusList } from '@/constants'
import { createDateRangeItems } from '@/utils'
import ValueSetSelect from '@/components/value-set-select/ValueSetSelect'
import AddressSelect from '@/components/address-select/AddressSelect'

export const userSearchSchema: SmartSchema = {
  userName: {
    title: '用户名',
  },
  mobile: {
    title: '手机号',
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

export const getUserFormSchema = (callbacks: {
  onChangeUserName: (value: React.ChangeEvent<HTMLInputElement>) => void
}): SmartSchema => {
  const { onChangeUserName } = callbacks
  return {
    userName: {
      title: '用户名',
      itemProps: {
        rules: [{ required: true, message: '请输入用户名' }],
      },
      props: {
        onChange: onChangeUserName,
      },
    },
    mobile: {
      title: '手机号',
      itemProps: {
        rules: [{ pattern: /(^1\d{10}$)/, message: '手机号格式不正确' }],
      },
    },
    nickName: {
      title: '昵称',
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
    birth: {
      title: '出生日期',
      widget: DatePicker,
      props: {
        format: 'YYYY-MM-DD',
      },
    },
    maritalStatus: {
      title: '婚姻',
      widget: ValueSetSelect,
      props: {
        setCode: 'SYS_MARITAL_STATUS',
      },
    },
    email: {
      title: '邮箱',
      itemProps: {
        rules: [
          { max: 100, message: '邮箱长度不符合要求' },
          { type: 'email' as const, message: '请输入正确的邮箱格式' },
        ],
      },
      colProps: { span: 24 },
    },
    address: {
      title: '地址',
      widget: AddressSelect,
      viewRender: (value: string | Record<string, string>[]) => {
        return value && Array.isArray(value) ? value.map((item) => item.name).join('/') : '-'
      },
      colProps: { span: 24 },
    },
    addressDetail: {
      title: '地址详情',
      itemProps: {
        rules: [{ max: 100, message: '地址长度不符合要求' }],
      },
      colProps: { span: 24 },
    },
    pinyin: {
      title: '全拼',
    },
    py: {
      title: '首拼',
    },
  }
}
