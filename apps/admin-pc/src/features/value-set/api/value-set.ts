import http from '@/api/http'
import { Backend, ExcelImportResult } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

/** 二进制文件响应(模板/导出)。成功时 data 为 Blob;业务失败返回 { head } 包装(拦截器已提示) */
export interface FileResponse {
  data: Blob
  /** 仅声明实际用到的响应头,避免 any */
  headers?: { 'content-disposition'?: string | null }
}

const valueSetApi = {
  page(
    params: Backend.ValueSetPageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageValueSetRes> {
    return http.get('/value-set/page', params, config)
  },
  findById(id: string | number): Promise<Backend.FindValueSetByIdRes> {
    return http.get('/value-set/find/' + id)
  },
  findByIds(ids: string): Promise<Backend.FindValueSetListByIdsRes> {
    return http.get('/value-set/batch/query', { ids })
  },
  create(params: Backend.ValueSetCreateDto): Promise<Backend.CreateValueSetRes> {
    return http.post('/value-set/create', params)
  },
  update(
    id: string | number,
    params: Backend.ValueSetUpdateDto,
  ): Promise<Backend.UpdateValueSetRes> {
    return http.post('/value-set/update/' + id, params)
  },
  delete(id: string | number): Promise<Backend.RemoveValueSetRes> {
    return http.post('/value-set/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveValueSetRes> {
    return http.post('/value-set/batch/delete', { ids })
  },
  updateStatus(
    id: string | number,
    status: number | string,
  ): Promise<Backend.UpdateValueSetStatusRes> {
    return http.post('/value-set/updateStatus/' + id, { status })
  },
  batchUpdateStatus(
    ids: string,
    status: number | string,
  ): Promise<Backend.BatchUpdateValueSetStatusRes> {
    return http.post('/value-set/batch/status', { ids, status })
  },
  resetPassword(params: Backend.ResetPasswordDto): Promise<Backend.ResetPasswordRes> {
    return http.post('/value-set/resetPassword', params)
  },
  getValueSetBySetCodes(
    params: Backend.ValueSetListDto,
  ): Promise<Backend.FindValueSetBySetCodesRes> {
    return http.get('/value-set/by-set-codes', params)
  },
  /** 集维度分页（按 setCode 去重，含值数量） */
  pageGroups(
    params: Backend.ValueSetGroupPageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageValueSetGroupsRes> {
    return http.get('/value-set/sets/page', params, config)
  },
  // ---- Excel 模板 / 导入 / 导出 ----
  /** 下载导入模板(.xlsx) */
  downloadValueSetTemplate(config?: AxiosRequestConfig): Promise<FileResponse> {
    return http.post('/value-set/template', undefined, { responseType: 'blob', ...config })
  },
  /** 导入字典值(部分成功语义:成功行已落库,失败行在 data.failedRows) */
  importValueSetFile(
    file: File,
  ): Promise<{ head: Backend.ResponseHeadDto; data: ExcelImportResult | null }> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/value-set/import', formData)
  },
  /** 按查询条件导出字典值(查询条件走 query,与列表保持一致) */
  exportValueSet(
    params: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<FileResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
    )
    return http.post('/value-set/export', undefined, {
      params: cleanParams,
      responseType: 'blob',
      ...config,
    })
  },
}
export default valueSetApi
