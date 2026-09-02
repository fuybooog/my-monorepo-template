import { InputNumber, Select } from 'antd'
import { SmartSchema } from '@/components/common'
import { Backend } from '@repo/types'
import { defaultStatusList } from '@/constants'

/** 集维度查询 schema */
export const valueSetSearchGroupSchema: SmartSchema = {
  setCode: {
    title: '集编码',
  },
  setName: {
    title: '集名称',
  },
}

/** 值查询 schema（详情页使用 setCode 过滤） */
export const valueSetSearchSchema: SmartSchema = {
  code: {
    title: '值编码',
  },
  name: {
    title: '值名称',
  },
  status: {
    title: '状态',
    widget: Select,
    props: {
      options: defaultStatusList,
    },
  },
}

/** 值表单 schema（新增 / 编辑值，编辑集时仅可见 setCode / setName） */
export const valueSetFormSchema: SmartSchema = {
  setCode: {
    title: '集编码',
    itemProps: {
      rules: [{ required: true, message: '请输入集编码' }],
    },
    props: {
      placeholder: '请输入集编码',
    },
  },
  setName: {
    title: '集名称',
    itemProps: {
      rules: [{ required: true, message: '请输入集名称' }],
    },
    props: {
      placeholder: '请输入集名称',
    },
  },
  code: {
    title: '值编码',
    itemProps: {
      rules: [{ required: true, message: '请输入值编码' }],
    },
    props: {
      placeholder: '请输入值编码',
    },
  },
  name: {
    title: '值名称',
    itemProps: {
      rules: [{ required: true, message: '请输入值名称' }],
    },
    props: {
      placeholder: '请输入值名称',
    },
  },
  status: {
    title: '状态',
    widget: Select,
    itemProps: {
      rules: [{ required: true, message: '请选择状态' }],
    },
    props: {
      options: defaultStatusList,
    },
  },
  sortNumber: {
    title: '排序号',
    widget: InputNumber,
    itemProps: {
      rules: [{ required: true, message: '请输入排序号' }],
    },
    props: {
      placeholder: '请输入排序号',
      style: { width: '100%' },
    },
  },
}

export type ValueSetFormSchema = Backend.ValueSetCreateDto
