import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { commonStatusRender } from './common-render-status'
import { DEFAULT_STATUS_MAP } from '@/constants'

describe('commonStatusRender', () => {
  it('默认模式：数字状态渲染默认映射', () => {
    render(commonStatusRender(1) as any)
    expect(screen.getByText('启用')).toBeInTheDocument()

    render(commonStatusRender(0) as any)
    expect(screen.getByText('禁用')).toBeInTheDocument()
  })

  it('默认模式：未命中或空值回退到 0 状态', () => {
    render(commonStatusRender(undefined as any) as any)
    expect(screen.getByText(DEFAULT_STATUS_MAP[0].text)).toBeInTheDocument()
  })

  it('生成器模式：使用自定义映射渲染', () => {
    const renderStatus = commonStatusRender(
      {
        pending: { text: '待审核', color: 'warning' },
        approved: { text: '已通过', color: 'success' },
      } as any,
      'pending',
    )
    render(renderStatus('pending' as any))
    expect(screen.getByText('待审核')).toBeInTheDocument()
  })

  it('生成器模式：未命中回退 defaultKey 映射（defaultKey 需存在于映射中）', () => {
    const renderStatus = commonStatusRender(
      { approved: { text: '已通过', color: 'success' } } as any,
      'approved',
    )
    render(renderStatus('unknown' as any))
    expect(screen.getByText('已通过')).toBeInTheDocument()
  })

  it('生成器模式：空值走默认 key', () => {
    const renderStatus = commonStatusRender(
      { pending: { text: '待审核', color: 'warning' } } as any,
      'pending',
    )
    render(renderStatus(null as any))
    expect(screen.getByText('待审核')).toBeInTheDocument()
  })
})
