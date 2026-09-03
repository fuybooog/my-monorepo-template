import { SmartSchema } from '@/components/common'
import { Select } from 'antd'
import { createDateRangeItems } from '@/utils'
import { LOG_ACTION_OPTIONS, LOG_LEVEL_OPTIONS, LOG_MODULE_OPTIONS } from '../constants'

const dateItems = createDateRangeItems({
  startDataIndex: 'createdStart',
  endDataIndex: 'createdEnd',
  startTitle: '操作时间',
  endTitle: '至',
})

export const operationLogSearchSchema: SmartSchema = {
  keyword: {
    title: '关键字',
    itemProps: {
      // 业务对象/摘要 模糊检索
    },
  },
  module: {
    title: '业务模块',
    widget: Select,
    props: {
      allowClear: true,
      options: LOG_MODULE_OPTIONS,
    },
  },
  operationType: {
    title: '操作',
    widget: Select,
    props: {
      allowClear: true,
      options: LOG_ACTION_OPTIONS,
    },
  },
  logLevel: {
    title: '级别',
    widget: Select,
    props: {
      allowClear: true,
      options: LOG_LEVEL_OPTIONS,
    },
  },
  operatorName: {
    title: '操作人',
  },
  ...dateItems,
}
