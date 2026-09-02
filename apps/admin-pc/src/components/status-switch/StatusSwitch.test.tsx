// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StatusSwitch } from './StatusSwitch'

const mocks = vi.hoisted(() => {
  const message = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
  return { message, getMessage: vi.fn(() => message) }
})

vi.mock('@/utils', () => ({ getMessage: mocks.getMessage }))

const record = { id: 1, status: 1 }
const renderSwitch = (overrides: any = {}) => {
  const props = {
    value: 1,
    record,
    activeVal: 1,
    inactiveVal: 0,
    onStatusChange: vi.fn().mockResolvedValue(undefined),
    refreshList: vi.fn(),
    ...overrides,
  }
  const utils = render(<StatusSwitch {...props} />)
  return { props, ...utils }
}

describe('StatusSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('value 等于 activeVal 时 Switch 处于选中态', () => {
    renderSwitch()
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('value 等于 inactiveVal 时 Switch 处于未选中态', () => {
    renderSwitch({ value: 0 })
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('切换时以 record 与反向状态调用 onStatusChange', async () => {
    const { props } = renderSwitch()
    fireEvent.click(screen.getByRole('switch'))
    expect(props.onStatusChange).toHaveBeenCalledWith(record, 0)
    await waitFor(() => expect(mocks.message.success).toHaveBeenCalled())
    expect(props.refreshList).toHaveBeenCalled()
  })

  it('onStatusChange 失败时不提示成功、不刷新列表', async () => {
    const { props } = renderSwitch({
      onStatusChange: vi.fn().mockRejectedValue(new Error('fail')),
    })
    fireEvent.click(screen.getByRole('switch'))
    await waitFor(() => expect(props.onStatusChange).toHaveBeenCalled())
    expect(mocks.message.success).not.toHaveBeenCalled()
    expect(props.refreshList).not.toHaveBeenCalled()
  })
})
