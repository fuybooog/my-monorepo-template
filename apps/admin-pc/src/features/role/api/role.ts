import http from '@/api/http'
import { Backend, ExcelImportResult } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

/** 二进制文件响应(模板/导出)。成功时 data 为 Blob;业务失败返回 { head } 包装(拦截器已提示) */
export interface FileResponse {
  data: Blob
  /** 仅声明实际用到的响应头,避免 any */
  headers?: { 'content-disposition'?: string | null }
}

const roleApi = {
  page(
    params: Partial<Backend.RolePageDto>,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageRoleRes> {
    return http.get('/role/page', params, config)
  },
  pageOptionRole(
    params: Partial<Backend.RolePageOptionDto>,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageOptionRoleRes> {
    return http.get('/role/option', params, config)
  },
  findById(id: string | number): Promise<Backend.FindRoleByIdRes> {
    return http.get('/role/find/' + id)
  },
  findByIds(ids: string | number): Promise<Backend.FindRoleListByIdsRes> {
    return http.get('/role/batch/query', { ids })
  },
  create(params: Backend.RoleCreateDto): Promise<Backend.CreateRoleRes> {
    return http.post('/role/create', params)
  },
  update(id: string | number, params: Backend.RoleUpdateDto): Promise<Backend.UpdateRoleRes> {
    return http.post('/role/update/' + id, params)
  },
  delete(id: string | number): Promise<Backend.RemoveRoleRes> {
    return http.post('/role/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveRoleRes> {
    return http.post('/role/batch/delete', { ids })
  },
  updateStatus(id: string | number, status: string): Promise<Backend.UpdateRoleStatusRes> {
    return http.post('/role/updateStatus/' + id, { status })
  },
  // ---- Excel 模板 / 导入 / 导出 ----
  /** 下载导入模板(.xlsx) */
  downloadRoleTemplate(config?: AxiosRequestConfig): Promise<FileResponse> {
    return http.post('/role/template', undefined, { responseType: 'blob', ...config })
  },
  /** 导入角色(部分成功语义:成功行已落库,失败行在 data.failedRows) */
  importRoleFile(
    file: File,
  ): Promise<{ head: Backend.ResponseHeadDto; data: ExcelImportResult | null }> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/role/import', formData)
  },
  /** 按查询条件导出角色(查询条件走 query,与列表保持一致) */
  exportRole(
    params: Partial<Backend.RolePageDto>,
    config?: AxiosRequestConfig,
  ): Promise<FileResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
    )
    return http.post('/role/export', undefined, {
      params: cleanParams,
      responseType: 'blob',
      ...config,
    })
  },
}
export default roleApi
