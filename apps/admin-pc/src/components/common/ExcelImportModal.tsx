import React, { useMemo, useState } from 'react'
import { Alert, Button, Modal, Space, Table, Upload } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ExcelImportResult } from '@repo/types'
import { EXCEL_MESSAGE, formatMessage } from '@/constants'
import { getMessage } from '@/utils/antd-instance'
import { downloadTextFile, saveBlob, toCsvString } from '@/utils'
import type { SmartTableExcelDownloadPayload } from './smart-types'

/** 与后端保持一致的单文件导入上限(MB) */
const DEFAULT_MAX_FILE_SIZE_MB = 20

interface FailedRowView {
  rowNo: number
  reason: string
}

export interface ExcelImportModalProps {
  open: boolean
  /** 弹窗标题,缺省「导入数据」 */
  importTitle?: string
  /** 下载导入模板(不传则隐藏入口) */
  downloadTemplate?: () => Promise<SmartTableExcelDownloadPayload | null>
  /** 上传导入文件;返回 null 表示文件级失败(错误已由请求层提示) */
  importFile?: (file: File) => Promise<ExcelImportResult | null>
  /** 导入完成(含部分成功)后回调,一般用于刷新列表 */
  onImportSuccess?: () => void
  onClose: () => void
}

/**
 * Excel 导入交互弹窗:下载模板 -> 选择文件 -> 导入 -> 结果(失败明细 / 下载 CSV)
 *
 * 默认模式由 SmartTable.excel 配置后自动渲染;自定义模式可自行受控复用本组件。
 */
export function ExcelImportModal({
  open,
  importTitle = EXCEL_MESSAGE.IMPORT_TITLE,
  downloadTemplate,
  importFile,
  onImportSuccess,
  onClose,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState<ExcelImportResult | null>(null)

  // 每次打开时重置状态：在渲染期间依据 open 变化同步（避免在 effect 内同步 setState 触发级联渲染）
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setFile(null)
      setResult(null)
      setImporting(false)
      setDownloading(false)
    }
  }

  const failedRowsView = useMemo<FailedRowView[]>(() => {
    if (!result) return []
    return result.failedRows.map((row) => ({
      rowNo: row.rowNo,
      reason: Object.entries(row.errors)
        .map(([column, message]) => `${column}: ${message}`)
        .join('；'),
    }))
  }, [result])

  const failedColumns = useMemo<ColumnsType<FailedRowView>>(
    () => [
      { title: EXCEL_MESSAGE.FAILED_ROW_NO, dataIndex: 'rowNo', width: 80 },
      { title: EXCEL_MESSAGE.FAILED_REASON, dataIndex: 'reason' },
    ],
    [],
  )

  const resetToUpload = () => {
    setFile(null)
    setResult(null)
  }

  const beforeUpload = (rawFile: File) => {
    const isXlsx = /\.xlsx$/i.test(rawFile.name)
    if (!isXlsx) {
      getMessage().error(EXCEL_MESSAGE.FILE_TYPE_INVALID)
      return Upload.LIST_IGNORE
    }
    if (rawFile.size > DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024) {
      getMessage().error(EXCEL_MESSAGE.FILE_SIZE_INVALID(DEFAULT_MAX_FILE_SIZE_MB))
      return Upload.LIST_IGNORE
    }
    setFile(rawFile)
    return Upload.LIST_IGNORE // 阻止自动上传,由「导入」按钮统一提交
  }

  const handleDownloadTemplate = async () => {
    if (!downloadTemplate || downloading) return
    setDownloading(true)
    try {
      const payload = await downloadTemplate()
      if (payload) saveBlob(payload.blob, payload.filename || EXCEL_MESSAGE.TEMPLATE_FILE_DEFAULT)
    } catch (error) {
      console.error('下载导入模板失败', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = async () => {
    if (!file || !importFile || importing) return
    setImporting(true)
    try {
      const data = await importFile(file)
      if (!data) return // 文件级失败,错误已由请求层提示
      if (data.failCount === 0) {
        getMessage().success(formatMessage.excelImportSuccess(data.successCount))
        onImportSuccess?.()
        onClose()
      } else {
        setResult(data) // 部分成功 / 全部失败:留在弹窗展示失败明细
      }
    } catch (error) {
      console.error('导入失败', error)
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadFailedFile = () => {
    if (!result) return
    const rows: (string | number)[][] = [
      [EXCEL_MESSAGE.FAILED_ROW_NO, EXCEL_MESSAGE.FAILED_REASON],
      ...result.failedRows.map((row) => [
        row.rowNo,
        Object.entries(row.errors)
          .map(([column, message]) => `${column}: ${message}`)
          .join('；'),
      ]),
    ]
    downloadTextFile(toCsvString(rows), EXCEL_MESSAGE.FAILED_FILE_NAME)
  }

  const closeWithRefresh = () => {
    if (result && result.successCount > 0) onImportSuccess?.()
    onClose()
  }

  const footer = result ? (
    <Space>
      <Button onClick={resetToUpload}>{EXCEL_MESSAGE.REUPLOAD}</Button>
      <Button icon={<DownloadOutlined />} onClick={handleDownloadFailedFile}>
        {EXCEL_MESSAGE.DOWNLOAD_FAILED_FILE}
      </Button>
      <Button type="primary" onClick={closeWithRefresh}>
        {EXCEL_MESSAGE.DONE}
      </Button>
    </Space>
  ) : (
    <Space>
      <Button onClick={onClose}>{EXCEL_MESSAGE.CANCEL}</Button>
      <Button
        type="primary"
        disabled={!file || !importFile}
        loading={importing}
        onClick={handleImport}
      >
        {EXCEL_MESSAGE.IMPORT_BUTTON}
      </Button>
    </Space>
  )

  return (
    <Modal
      title={importTitle}
      open={open}
      onCancel={onClose}
      footer={footer}
      width={result ? 720 : 520}
      destroyOnHidden
    >
      {result ? (
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            type={result.successCount > 0 ? 'warning' : 'error'}
            showIcon
            title={
              result.successCount > 0
                ? EXCEL_MESSAGE.RESULT_PARTIAL
                : EXCEL_MESSAGE.RESULT_ALL_FAILED
            }
            description={formatMessage.excelImportSummary(result.successCount, result.failCount)}
          />
          <Table<FailedRowView>
            rowKey="rowNo"
            size="small"
            columns={failedColumns}
            dataSource={failedRowsView}
            pagination={{ pageSize: 5, size: 'small' }}
            scroll={{ y: 240 }}
            title={() => EXCEL_MESSAGE.FAILED_DETAIL_TITLE}
          />
        </Space>
      ) : (
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{EXCEL_MESSAGE.IMPORT_HINT}</span>
          {downloadTemplate && (
            <Button
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownloadTemplate}
            >
              {EXCEL_MESSAGE.TEMPLATE_DOWNLOAD}
            </Button>
          )}
          <Upload accept=".xlsx" showUploadList={false} beforeUpload={beforeUpload}>
            <Button icon={<UploadOutlined />} disabled={importing}>
              {file ? file.name : EXCEL_MESSAGE.FILE_SELECT}
            </Button>
          </Upload>
        </Space>
      )}
    </Modal>
  )
}
