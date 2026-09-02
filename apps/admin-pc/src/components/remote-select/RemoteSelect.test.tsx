// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConfigProvider } from 'antd'
import { RemoteSelect } from './RemoteSelect'

// 包装 ConfigProvider 禁用动画
const renderWithConfig = (ui: React.ReactElement) => {
  return render(<ConfigProvider wave={{ disabled: true }}>{ui}</ConfigProvider>)
}

describe('RemoteSelect 测试套件', () => {
  const mockFetchApi = vi.fn()
  const mockFetchByIdsApi = vi.fn()
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. 基础渲染
  describe('1. 基础渲染', () => {
    it('应该正确渲染默认占位符和 combobox 节点', () => {
      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} />)
      expect(screen.getByText('请输入关键字搜索')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('应该支持自定义 placeholder', () => {
      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} placeholder="请选择人员" />)
      expect(screen.getByText('请选择人员')).toBeInTheDocument()
    })

    it('展开下拉框时，如果无数据应触发首次加载', async () => {
      mockFetchApi.mockResolvedValueOnce({
        list: [{ id: 1, name: '张三' }],
        total: 1,
      })

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} />)
      const select = screen.getByRole('combobox')

      fireEvent.mouseDown(select)

      await waitFor(() => {
        expect(mockFetchApi).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: '', page: 1, pageSize: 20 }),
        )
      })

      expect(await screen.findByText('张三')).toBeInTheDocument()
    })
  })
})
