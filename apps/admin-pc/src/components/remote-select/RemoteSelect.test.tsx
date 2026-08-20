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

  // 2. 远程搜索与防抖
  describe('2. 远程搜索与防抖', () => {
    it('输入搜索关键字时应触发防抖加载', async () => {
      vi.useFakeTimers()
      mockFetchApi.mockResolvedValue({ list: [], total: 0 })

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} debounceTimeout={300} />)
      const input = screen.getByRole('combobox')

      // 使用 fireEvent.change 并包裹在 act 中
      act(() => {
        fireEvent.change(input, { target: { value: '李' } })
      })

      expect(mockFetchApi).not.toHaveBeenCalled()

      // 前进定时器触发 debounce
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(mockFetchApi).toHaveBeenCalledWith(expect.objectContaining({ keyword: '李', page: 1 }))

      vi.useRealTimers()
    })

    it('能够自定义 fieldNames 格式化 label 和 value', async () => {
      const mockCustomFetch = vi.fn().mockResolvedValue({
        list: [{ code: 100, title: '自定义名称' }],
        total: 1,
      })

      renderWithConfig(
        <RemoteSelect
          fetchApi={mockCustomFetch}
          fieldNames={{
            label: (item: any) => `[${item.code}] ${item.title}`,
            value: 'code',
          }}
        />,
      )

      fireEvent.mouseDown(screen.getByRole('combobox'))

      expect(await screen.findByText('[100] 自定义名称')).toBeInTheDocument()
    })
  })

  // 3. 回显逻辑
  describe('3. 回显逻辑', () => {
    it('当传入初始 value 时，能够通过 fetchByIdsApi 正确回显 Label', async () => {
      mockFetchByIdsApi.mockResolvedValueOnce([{ id: 99, name: '已选回显项' }])

      renderWithConfig(
        <RemoteSelect value={99} fetchApi={mockFetchApi} fetchByIdsApi={mockFetchByIdsApi} />,
      )

      await waitFor(() => {
        expect(mockFetchByIdsApi).toHaveBeenCalledWith([99])
      })

      expect(await screen.findByText('已选回显项')).toBeInTheDocument()
    })

    it('不应该对重复的 ID 再次发起回显请求', async () => {
      mockFetchByIdsApi.mockResolvedValue([{ id: 99, name: '已选回显项' }])

      const { rerender } = renderWithConfig(
        <RemoteSelect value={99} fetchApi={mockFetchApi} fetchByIdsApi={mockFetchByIdsApi} />,
      )

      await waitFor(() => {
        expect(mockFetchByIdsApi).toHaveBeenCalledTimes(1)
      })

      rerender(
        <ConfigProvider wave={{ disabled: true }}>
          <RemoteSelect value={99} fetchApi={mockFetchApi} fetchByIdsApi={mockFetchByIdsApi} />
        </ConfigProvider>,
      )

      expect(mockFetchByIdsApi).toHaveBeenCalledTimes(1)
    })
  })

  // 4. 下拉触底加载更多
  describe('4. 下拉触底加载更多', () => {
    it('滚动到底部且 hasMore 为 true 时，应加载下一页数据', async () => {
      mockFetchApi
        .mockResolvedValueOnce({
          list: [{ id: 1, name: '第一页数据' }],
          total: 40,
        })
        .mockResolvedValueOnce({
          list: [{ id: 2, name: '第二页数据' }],
          total: 40,
        })

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} pageSize={20} />)

      fireEvent.mouseDown(screen.getByRole('combobox'))
      await screen.findByText('第一页数据')

      const popupList = document.querySelector('.rc-virtual-list-holder') as HTMLElement
      if (popupList) {
        Object.defineProperty(popupList, 'scrollTop', { value: 500, configurable: true })
        Object.defineProperty(popupList, 'scrollHeight', { value: 510, configurable: true })
        Object.defineProperty(popupList, 'clientHeight', { value: 10, configurable: true })

        act(() => {
          fireEvent.scroll(popupList)
        })
      }

      await waitFor(() => {
        expect(mockFetchApi).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: '', page: 2, pageSize: 20 }),
        )
      })

      expect(await screen.findByText('第二页数据')).toBeInTheDocument()
    })
  })

  // 5. 异常处理与重试机制
  describe('5. 异常处理与重试机制', () => {
    it('接口请求失败时显示错误信息及重试按钮，点击重试可重新加载', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('Network Error'))

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} />)

      fireEvent.mouseDown(screen.getByRole('combobox'))

      const retryBtn = await screen.findByText('重试')
      expect(screen.getByText('加载失败')).toBeInTheDocument()

      mockFetchApi.mockResolvedValueOnce({
        list: [{ id: 1, name: '重试成功项' }],
        total: 1,
      })

      act(() => {
        fireEvent.click(retryBtn)
      })

      expect(await screen.findByText('重试成功项')).toBeInTheDocument()
    })

    it('当 list 为空时应显示 Empty 状态', async () => {
      mockFetchApi.mockResolvedValueOnce({ list: [], total: 0 })

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} />)

      fireEvent.mouseDown(screen.getByRole('combobox'))

      expect(await screen.findByText('暂无数据')).toBeInTheDocument()
    })
  })

  // 6. 交互与参数透传
  describe('6. 交互与参数透传', () => {
    it('选择选项时应正常触发 onChange 回调', async () => {
      mockFetchApi.mockResolvedValueOnce({
        list: [{ id: 10, name: '测试选项' }],
        total: 1,
      })

      renderWithConfig(<RemoteSelect fetchApi={mockFetchApi} onChange={mockOnChange} />)

      fireEvent.mouseDown(screen.getByRole('combobox'))
      const option = await screen.findByText('测试选项')

      act(() => {
        fireEvent.click(option)
      })

      expect(mockOnChange).toHaveBeenCalledWith(10, expect.anything())
    })

    it('应当将 extraParams 透传至 fetchApi', async () => {
      mockFetchApi.mockResolvedValueOnce({ list: [], total: 0 })

      renderWithConfig(
        <RemoteSelect fetchApi={mockFetchApi} extraParams={{ status: 'ACTIVE', type: 1 }} />,
      )

      fireEvent.mouseDown(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(mockFetchApi).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'ACTIVE', type: 1 }),
        )
      })
    })
  })
})
