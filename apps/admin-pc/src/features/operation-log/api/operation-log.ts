import http from '@/api/http'
import { AxiosRequestConfig } from 'axios'
import type {
  OperationLogCleanPayload,
  OperationLogCleanResult,
  OperationLogDetailRespDto,
  OperationLogPageQuery,
  OperationLogPageRespDto,
} from '../types'

/** 二进制文件响应(导出)。成功时 data 为 Blob;业务失败返回 { head } 包装(拦截器已提示) */
export interface FileResponse {
  data: Blob
  headers?: { 'content-disposition'?: string | null }
}

export interface ResponseHeadDto {
  errCode: number
  errMsg?: string
}

export interface PageResp<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

interface Wrapped<T> {
  head: ResponseHeadDto
  data: T
}

const operationLogApi = {
  /** 分页查询（查询条件走 query，与列表一致） */
  page(
    params: Partial<OperationLogPageQuery>,
    config?: AxiosRequestConfig,
  ): Promise<Wrapped<PageResp<OperationLogPageRespDto>>> {
    return http.get('/operation-log/page', params, config)
  },
  /** 详情（含字段级变更明细） */
  findById(id: number): Promise<Wrapped<OperationLogDetailRespDto>> {
    return http.get(`/operation-log/detail/${id}`)
  },
  /** 按查询条件导出 xlsx */
  exportLogs(
    params: Partial<OperationLogPageQuery>,
    config?: AxiosRequestConfig,
  ): Promise<FileResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
    )
    return http.post('/operation-log/export', undefined, {
      params: cleanParams,
      responseType: 'blob',
      ...config,
    })
  },
  /** 清理日志（dryRun=true 仅预览） */
  clean(body: OperationLogCleanPayload): Promise<Wrapped<OperationLogCleanResult>> {
    return http.post('/operation-log/clean', body)
  },
}

export default operationLogApi
