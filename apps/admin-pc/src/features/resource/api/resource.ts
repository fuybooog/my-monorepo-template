import http from '@/api/http'
import { Backend, ExcelImportResult } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

/** 二进制文件响应(模板/导出)。成功时 data 为 Blob;业务失败返回 { head } 包装(拦截器已提示) */
export interface FileResponse {
  data: Blob
  /** 仅声明实际用到的响应头,避免 any */
  headers?: { 'content-disposition'?: string | null }
}

const resourceApi = {
  page(
    params: Backend.ResourcePageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageResourceRes> {
    return http.get('/resource/page', params, config)
  },
  list(
    params: Backend.ResourcePageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.ListAllResourceRes> {
    return http.get('/resource/list', params, config)
  },
  listByUser(params?: {
    userId?: number
    types: string
    notInMenu?: 0 | 1
  }): Promise<Backend.ListResourceByUserRes> {
    return http.get('/resource/listByUser', params)
  },
  findById(id: string | number): Promise<Backend.FindResourceByIdRes> {
    return http.get('/resource/find/' + id)
  },
  create(params: Backend.ResourceCreateDto): Promise<Backend.CreateResourceRes> {
    return http.post('/resource/create', params)
  },
  update(
    id: string | number,
    params: Backend.ResourceUpdateDto,
  ): Promise<Backend.UpdateResourceRes> {
    return http.post('/resource/update/' + id, params)
  },
  batchUpdate(params: Backend.ResourceBatchUpdateDto): Promise<Backend.BatchUpdateResourceRes> {
    return http.post('/resource/batchUpdate', params)
  },
  delete(id: string | number): Promise<Backend.RemoveResourceRes> {
    return http.post('/resource/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveResourceRes> {
    return http.post('/resource/batch/delete', { ids })
  },
  updateStatus(id: string | number, status: string): Promise<Backend.UpdateResourceStatusRes> {
    return http.post('/resource/updateStatus/' + id, { status })
  },
  resetSort() {
    return http.post('/resource/resetSort')
  },
  // ---- Excel 模板 / 导入 / 导出 ----
  /** 下载导入模板(.xlsx) */
  downloadResourceTemplate(config?: AxiosRequestConfig): Promise<FileResponse> {
    return http.post('/resource/template', undefined, { responseType: 'blob', ...config })
  },
  /** 导入资源(部分成功语义:成功行已落库,失败行在 data.failedRows) */
  importResourceFile(
    file: File,
  ): Promise<{ head: Backend.ResponseHeadDto; data: ExcelImportResult | null }> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/resource/import', formData)
  },
  /** 按查询条件导出资源(查询条件走 query,与列表保持一致) */
  exportResource(
    params: Backend.ResourcePageDto,
    config?: AxiosRequestConfig,
  ): Promise<FileResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
    )
    return http.post('/resource/export', undefined, {
      params: cleanParams,
      responseType: 'blob',
      ...config,
    })
  },
}
export default resourceApi
