/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect } from 'react'
import { Button, Col, Form, FormInstance, Input, Row, RowProps, Space } from 'antd'
import dayjs from 'dayjs'
import {
  SmartFormExtraProps,
  SmartFormItem,
  SmartFormMode,
  SmartFormProps,
  SmartSchema,
} from './smart-types'
import { ValueSetViewer } from '../value-set-select/ValueSetViewer'

// ==========================================
// 1. Custom Hooks
// ==========================================

/** 响应 URL 参数同步逻辑 */
const useUrlParamsSync = ({
  syncUrlParams,
  mode,
  schema,
  form,
  urlParamsTransform,
}: {
  syncUrlParams?: boolean
  mode: SmartFormMode
  schema: SmartSchema
  form: FormInstance
  urlParamsTransform?: SmartFormProps['urlParamsTransform']
}) => {
  useEffect(() => {
    if (!syncUrlParams || mode !== 'query') return

    const searchParams = new URLSearchParams(window.location.search)
    const urlFields: Record<string, string> = {}

    Object.keys(schema).forEach((key) => {
      const val = searchParams.get(key)
      if (val !== null) {
        urlFields[key] = val
      }
    })

    if (Object.keys(urlFields).length > 0) {
      const finalFields = urlParamsTransform ? urlParamsTransform(urlFields) : urlFields
      form.setFieldsValue(finalFields)
      form.submit()
    }
  }, [syncUrlParams, schema, form, mode, urlParamsTransform])
}

/** 自动提交处理逻辑 */
const useAutoSubmitHandler = ({
  mode,
  autoSubmit,
  schema,
  form,
  onValuesChange,
}: {
  mode: SmartFormMode
  autoSubmit?: boolean
  schema: SmartSchema
  form: FormInstance
  onValuesChange?: SmartFormProps['onValuesChange']
}) => {
  return (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    onValuesChange?.(changedValues, allValues)

    if (mode !== 'query' || !autoSubmit) return

    const changedKey = Object.keys(changedValues)[0]
    if (!changedKey) return

    const itemSchema = schema[changedKey]
    if (!itemSchema) return

    const widgetName = itemSchema.widget?.displayName || itemSchema.widget?.name || ''

    const isSelectOrPicker =
      /select|picker|radio|checkbox|cascader/i.test(widgetName) ||
      'options' in (itemSchema.props || {}) ||
      dayjs.isDayjs(changedValues[changedKey])

    if (isSelectOrPicker) {
      form.submit()
    }

    const isInputWidget = /input/i.test(widgetName)
    const isCleared = changedValues[changedKey] === undefined || changedValues[changedKey] === ''

    if (isInputWidget && isCleared) {
      form.submit()
    }
  }
}

// ==========================================
// 2. 细粒度组件
// ==========================================

/** 渲染控件的基础属性解析 Hook */
const useWidgetProps = (item: SmartFormItem, itemKey: string) => {
  return useMemo(() => {
    let defaultProps: Record<string, unknown> = { allowClear: true }

    if (item.widget?.displayName === 'Input') {
      defaultProps = {
        ...defaultProps,
        placeholder: typeof item.title === 'string' ? `请输入${item.title}` : undefined,
        autoComplete: 'off',
      }
    } else if (item.widget?.displayName === 'Select') {
      defaultProps = {
        ...defaultProps,
        ...(typeof item.title === 'string' ? { placeholder: item.title } : {}),
        fieldNames: { value: 'id', label: 'name' },
      }
    }

    const valueSetDefault: { actualNameField?: string | boolean } = {}
    if (item.widget?.displayName === 'ValueSetSelect') {
      if (item.props.actualNameField && typeof item.props.actualNameField === 'string') {
        valueSetDefault.actualNameField = item.props.actualNameField
      } else if (item.props.actualNameField !== false) {
        valueSetDefault.actualNameField = `${itemKey}Name`
      }
    }

    return { ...defaultProps, ...(item.props as Record<string, unknown>), ...valueSetDefault }
  }, [item, itemKey])
}

/** 辅助函数：从对象中提取展示用的 label */
const getItemLabel = (
  obj: Record<string, string | number | boolean>,
  fieldNames?: { label?: string; value?: string },
) => {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const labelKey = fieldNames?.label || 'label'
  return obj[labelKey] ?? obj.name ?? obj.label ?? obj.title ?? obj.code ?? JSON.stringify(obj)
}

/** 强化版 View 模式值转换工具 */
const formatViewValue = (
  itemKey: string,
  val: any,
  item: SmartFormItem,
  allValues: Record<string, any> = {},
): React.ReactNode => {
  // 1. 空值兜底
  if (val === undefined || val === null || val === '') {
    return '-'
  }

  const { props = {} } = item
  const fieldNames = props.fieldNames

  // =========================================================
  // 处理情况一：值为对象或对象数组 { id: 1, name: '张三' }
  // =========================================================
  if (typeof val === 'object' && !dayjs.isDayjs(val)) {
    // 多选对象数组 [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
    if (Array.isArray(val)) {
      if (val.length === 0) return '-'
      return val.map((item) => getItemLabel(item, fieldNames)).join(', ')
    }
    // 单选对象 { id: 1, name: '张三' }
    return getItemLabel(val, fieldNames)
  }

  // =========================================================
  // 处理情况二：针对 ValueSetSelect 等异步组件的自动 Name 匹配
  // 规则：如果字段叫 roleCode，优先尝试从 allValues 中获取 roleCodeName / roleCodeText
  // =========================================================
  if (typeof itemKey === 'string') {
    const autoNameKeys = [`${itemKey}Name`, `${itemKey}Text`, `${itemKey}_name`]
    for (const key of autoNameKeys) {
      if (allValues[key] !== undefined && allValues[key] !== null) {
        return String(allValues[key])
      }
    }
  }

  // =========================================================
  // 处理常规配置了静态 props.options / props.treeData 的组件
  // =========================================================
  const options = (props.options || props.treeData) as Array<Record<string, any>> | undefined

  if (options && Array.isArray(options)) {
    const valueKey = fieldNames?.value || 'value'
    const valArray = Array.isArray(val)
      ? val
      : typeof val === 'string' && val.includes(',')
        ? val.split(',')
        : [val]

    const matchedLabels = valArray
      .map((targetVal) => {
        const matched = options.find(
          (opt) => String(opt[valueKey] ?? opt.id ?? opt.code) === String(targetVal),
        )
        return matched ? getItemLabel(matched, fieldNames) : targetVal
      })
      .filter((v) => v !== undefined && v !== null)

    return matchedLabels.length > 0 ? matchedLabels.join(', ') : '-'
  }

  // 基础类型兜底直接输出字符串
  return String(val)
}

const SmartFormItemField: React.FC<{
  itemKey: string
  item: SmartFormItem
  mode: SmartFormMode
  form: FormInstance
}> = ({ itemKey, item, mode, form }) => {
  const mergedProps = useWidgetProps(item, itemKey)
  const WidgetComponent = item.widget || Input

  if (item.hiddenModes?.includes(mode)) return null

  // ==========================================
  // 1. view 模式
  // ==========================================
  if (mode === 'view') {
    return (
      // ⚠️ 关键点：外层 Form.Item 绝对不能传 name 属性！
      <Form.Item key={itemKey} label={item.title} {...item.itemProps}>
        {/* 内层 Form.Item 加 shouldUpdate，保证 setFieldsValue 时精准重新渲染 */}
        <Form.Item noStyle shouldUpdate>
          {() => {
            // 直接通过传入的 form 实例实时获取最新的值
            const val = form.getFieldValue(itemKey)

            if (item.viewRender) {
              return item.viewRender(val, form.getFieldsValue())
            }
            if (item.widget.displayName === 'ValueSetSelect' && item.props?.setCode) {
              return <ValueSetViewer setCode={item.props.setCode} value={val} />
            }
            return <span>{formatViewValue(itemKey, val, item, form.getFieldsValue())}</span>
          }}
        </Form.Item>
      </Form.Item>
    )
  }

  // ==========================================
  // 2. edit / create / query 模式
  // ==========================================
  return (
    <>
      {mergedProps.actualNameField && mode !== 'query' && (
        <Form.Item name={mergedProps.actualNameField} hidden style={{ display: 'none' }}>
          <Input hidden />
        </Form.Item>
      )}
      <Form.Item key={itemKey} name={itemKey} label={item.title} {...item.itemProps}>
        {item.render ? (
          item.render(form)
        ) : WidgetComponent ? (
          <WidgetComponent {...mergedProps} />
        ) : null}
      </Form.Item>
    </>
  )
}

/** 操作按钮组组件 */
const FormActions: React.FC<{
  mode: SmartFormMode
  form: FormInstance
  grid: boolean | RowProps
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
}> = ({ mode, form, actionRender, children, grid }) => {
  if (children) return <>{children}</>
  if (actionRender) return <>{actionRender(form, mode)}</>

  if (mode === 'query') {
    return (
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button
            onClick={() => {
              form.resetFields()
              form.submit()
            }}
          >
            重置
          </Button>
        </Space>
      </Form.Item>
    )
  }
  const buttonsRender = () => {
    return (
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => form.resetFields()}>重置</Button>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Space>
      </Form.Item>
    )
  }

  if (mode === 'create' || mode === 'edit') {
    if (grid) {
      return <Col span={24}>{buttonsRender()}</Col>
    }
    return buttonsRender()
  }

  return null
}

// ==========================================
// 3. 主组件及内容组件
// ==========================================

const SmartFormContent: React.FC<{
  schema: SmartSchema
  mode: SmartFormMode
  form: FormInstance
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
  grid?: boolean | RowProps
}> = ({ schema, mode, actionRender, children, form, grid = false }) => {
  const renderItem = (key: string, item: SmartFormItem) => (
    <SmartFormItemField key={key} itemKey={key} item={item} mode={mode} form={form} />
  )

  return (
    <>
      {Object.entries(schema).map(([key, item]) => {
        if (item.hiddenModes?.includes(mode)) return null

        const colSpan = item.colProps || { span: 24 }
        return grid ? (
          <Col key={key} {...colSpan}>
            {renderItem(key, item)}
          </Col>
        ) : (
          renderItem(key, item)
        )
      })}

      <FormActions mode={mode} form={form} actionRender={actionRender} grid={grid}>
        {children}
      </FormActions>
    </>
  )
}

export const SmartForm: React.FC<SmartFormProps> = ({
  schema,
  mode = 'query',
  actionRender,
  children,
  layout,
  form,
  syncUrlParams = false,
  urlParamsTransform,
  initialValues,
  autoSubmit = true,
  onValuesChange,
  grid = false,
  labelWidth = 100,
  ...restFormProps
}) => {
  const [internalForm] = Form.useForm()
  const activeForm = form || internalForm
  const rowProp = typeof grid === 'object' ? grid : { gutter: 16 }
  const formattedLabelWidth = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth
  const defaultProps = {
    labelAlign: restFormProps.labelAlign || (mode === 'query' ? 'left' : 'right'),
    layout: layout || (mode === 'query' ? 'inline' : 'horizontal'),
    ...(mode !== 'query'
      ? {
          labelCol: { flex: `0 0 ${formattedLabelWidth}` },
          wrapperCol: { flex: '1' },
        }
      : {}),
  }

  // 副作用 Hook
  useUrlParamsSync({
    syncUrlParams,
    mode,
    schema,
    form: activeForm,
    urlParamsTransform,
  })

  const handleValuesChange = useAutoSubmitHandler({
    mode,
    autoSubmit,
    schema,
    form: activeForm,
    onValuesChange,
  })

  const renderContent = () => (
    <SmartFormContent
      schema={schema}
      mode={mode}
      actionRender={actionRender}
      form={activeForm}
      grid={grid}
    >
      {children}
    </SmartFormContent>
  )

  return (
    <Form
      form={activeForm}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      {...defaultProps}
      {...restFormProps}
    >
      {grid ? <Row {...rowProp}>{renderContent()}</Row> : renderContent()}
    </Form>
  )
}
