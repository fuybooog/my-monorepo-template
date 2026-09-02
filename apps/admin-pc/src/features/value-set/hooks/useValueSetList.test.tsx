// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { fetchSetValueIds, useValueSetList } from './useValueSetList'

const mocks = vi.hoisted(() => {
  const valueSetApi = {
    getValueSetBySetCodes: vi.fn(),
    pageGroups: vi.fn(),
    batchDelete: vi.fn(),
  }
  const message = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
  return { valueSetApi, getMessage: vi.fn(() => message), message }
})

vi.mock('../api/value-set', () => ({ default: mocks.valueSetApi }))
vi.mock('@/utils/antd-instance', () => ({ getMessage: mocks.getMessage }))

const okResp = (data: any) => ({ head: { errCode: 0, errMsg: 'ok' }, data })

describe('fetchSetValueIds', () => {
  it('根据 setCode 拉取值集条目 id 列表', async () => {
    mocks.valueSetApi.getValueSetBySetCodes.mockResolvedValue(
      okResp({ list: [{ id: 1 }, { id: 2 }, { id: 3 }] }),
    )
    const ids = await fetchSetValueIds('status')
    expect(mocks.valueSetApi.getValueSetBySetCodes).toHaveBeenCalledWith({ setCodes: 'status' })
    expect(ids).toEqual([1, 2, 3])
  })

  it('列表为空时返回空数组', async () => {
    mocks.valueSetApi.getValueSetBySetCodes.mockResolvedValue(okResp({ list: [] }))
    expect(await fetchSetValueIds('x')).toEqual([])
  })
})

describe('useValueSetList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handleFetchData 返回 { data, total }', async () => {
    mocks.valueSetApi.pageGroups.mockResolvedValue(
      okResp({ list: [{ id: 1 }, { id: 2 }], total: 2 }),
    )
    const { result } = renderHook(() => useValueSetList())
    const res = await act(async () => result.current.handleFetchData({ page: 1, pageSize: 10 }))
    expect(res).toEqual({ data: [{ id: 1 }, { id: 2 }], total: 2 })
    expect(mocks.valueSetApi.pageGroups).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })

  it('onDelete：批量删除选中值集并提示', async () => {
    mocks.valueSetApi.getValueSetBySetCodes.mockResolvedValue(okResp({ list: [{ id: 10 }] }))
    mocks.valueSetApi.batchDelete.mockResolvedValue(okResp({}))
    const { result } = renderHook(() => useValueSetList())
    await act(async () => result.current.onDelete({ setCode: 'status', name: '状态' } as any))
    expect(mocks.valueSetApi.batchDelete).toHaveBeenCalledWith('10')
    expect(mocks.message.success).toHaveBeenCalled()
  })

  it('onDelete：值集为空时提示错误且不请求删除', async () => {
    mocks.valueSetApi.getValueSetBySetCodes.mockResolvedValue(okResp({ list: [] }))
    const { result } = renderHook(() => useValueSetList())
    await act(async () => result.current.onDelete({ setCode: 'empty' } as any))
    expect(mocks.valueSetApi.batchDelete).not.toHaveBeenCalled()
    expect(mocks.message.error).toHaveBeenCalled()
  })

  it('onBatchDelete：合并去重多条记录 id 后批量删除', async () => {
    mocks.valueSetApi.getValueSetBySetCodes
      .mockResolvedValueOnce(okResp({ list: [{ id: 1 }, { id: 2 }] }))
      .mockResolvedValueOnce(okResp({ list: [{ id: 2 }, { id: 3 }] }))
    mocks.valueSetApi.batchDelete.mockResolvedValue(okResp({}))
    const { result } = renderHook(() => useValueSetList())
    await act(async () => result.current.onBatchDelete([{ setCode: 'a' }, { setCode: 'b' }] as any))
    expect(mocks.valueSetApi.batchDelete).toHaveBeenCalledWith('1,2,3')
    expect(mocks.message.success).toHaveBeenCalled()
  })

  it('onBatchDelete：无选中时提示错误', async () => {
    const { result } = renderHook(() => useValueSetList())
    await act(async () => result.current.onBatchDelete([]))
    expect(mocks.valueSetApi.batchDelete).not.toHaveBeenCalled()
    expect(mocks.message.error).toHaveBeenCalled()
  })
})
