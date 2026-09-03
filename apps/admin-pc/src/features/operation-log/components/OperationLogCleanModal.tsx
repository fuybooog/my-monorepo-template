import { useState } from 'react'
import { Alert, Button, DatePicker, Form, Modal, Select, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import { getMessage, getModal } from '@/utils/antd-instance'
import { CONFIRM_MESSAGE, SUCCESS_MESSAGE, formatMessage } from '@/constants'
import operationLogApi from '../api/operation-log'
import { LOG_LEVEL_OPTIONS } from '../constants'
import type { OperationLogCleanResult } from '../types'

/**
 * 清理日志弹窗：两步确认。
 * 1) 「预览清理」：dryRun 返回将清理条数（不删数据）；
 * 2) 「确认清理」：二次确认后物理删除（删除前自动归档 JSONL）。
 * 默认按保留策略执行（信息 180 天 / 警告 365 天 / 错误 730 天），
 * 可通过「级别/截止日期」收窄范围；截止日期含义为“该日期(不含)之前”。
 */
export function OperationLogCleanModal(props: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { open, onClose, onSuccess } = props
  const [form] = Form.useForm<{ logLevel?: number; beforeDate?: dayjs.Dayjs }>()
  const [preview, setPreview] = useState<OperationLogCleanResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  const reset = () => {
    form.resetFields()
    setPreview(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const buildPayload = (dryRun: boolean) => {
    const values = form.getFieldsValue()
    return {
      logLevel: values.logLevel,
      beforeDate: values.beforeDate ? values.beforeDate.format('YYYY-MM-DD') : undefined,
      dryRun,
    }
  }

  const handlePreview = async () => {
    setPreviewing(true)
    try {
      const res = await operationLogApi.clean(buildPayload(true))
      setPreview(res.data)
    } finally {
      setPreviewing(false)
    }
  }

  const handleConfirmClean = async () => {
    if (!preview || preview.willDelete === 0) return
    const confirmed = await getModal().confirm({
      title: CONFIRM_MESSAGE.OPERATION_LOG_CLEAN_TITLE,
      content: CONFIRM_MESSAGE.OPERATION_LOG_CLEAN,
    })
    if (!confirmed) return

    setCleaning(true)
    try {
      const res = await operationLogApi.clean(buildPayload(false))
      setPreview(res.data)
      getMessage().success(SUCCESS_MESSAGE.OPERATION_LOG_CLEAN)
      onSuccess()
      handleClose()
    } finally {
      setCleaning(false)
    }
  }

  return (
    <Modal
      title={CONFIRM_MESSAGE.OPERATION_LOG_CLEAN_TITLE}
      open={open}
      onCancel={handleClose}
      width={520}
      footer={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button loading={previewing} onClick={handlePreview}>
            预览清理
          </Button>
          <Button
            type="primary"
            danger
            loading={cleaning}
            disabled={!preview || preview.willDelete === 0}
            onClick={handleConfirmClean}
          >
            确认清理
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        message="默认保留策略：信息 180 天 / 警告 365 天 / 错误 730 天；不选条件即按策略清理"
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="inline" style={{ rowGap: 8 }}>
        <Form.Item name="logLevel" label="级别">
          <Select
            allowClear
            placeholder="全部级别"
            options={LOG_LEVEL_OPTIONS}
            style={{ width: 140 }}
          />
        </Form.Item>
        <Form.Item name="beforeDate" label="仅清理之前">
          <DatePicker allowClear placeholder="如 2025-01-01" />
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
        截止日期含义：清理该日期（不含当天）之前产生的日志；留空则按级别默认保留期计算。
        清理前会将命中日志归档到服务器 archive 目录（JSONL），随后物理删除，不可恢复。
      </Typography.Paragraph>
      {preview && (
        <Alert
          type={preview.willDelete > 0 ? 'warning' : 'success'}
          showIcon
          message={formatMessage.operationLogCleanPreview(preview.willDelete)}
        />
      )}
    </Modal>
  )
}
