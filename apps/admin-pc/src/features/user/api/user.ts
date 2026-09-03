import http from '@/api/http'
import { Backend, ExcelImportResult } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

/** 二进制文件响应(模板/导出)。成功时 data 为 Blob;业务失败返回 { head } 包装(拦截器已提示) */
export interface FileResponse {
  data: Blob
  /** 仅声明实际用到的响应头,避免 any */
  headers?: { 'content-disposition'?: string | null }
}

const userApi = {
  page(params: Backend.UserPageDto, config?: AxiosRequestConfig): Promise<Backend.PageUserRes> {
    return http.get('/user/page', params, config)
  },
  findById(id: string | number): Promise<Backend.FindUserByIdRes> {
    return http.get('/user/find/' + id)
  },
  findRolesByUserId(id: string | number): Promise<Backend.FindRolesByUserIdRes> {
    return http.get('/user/findRolesByUserId/' + id)
  },
  assignRolesToUser(
    id: number,
    params: Backend.AssignRolesToUserDto,
  ): Promise<Backend.AssignRolesToUserRes> {
    return http.get('/user/assignRolesToUser/' + id, params)
  },
  findByIds(ids: string): Promise<Backend.FindUserListByIdsRes> {
    return http.get('/user/batch/query', { ids })
  },
  create(params: Backend.UserCreateDto): Promise<Backend.CreateUserRes> {
    return http.post('/user/create', params)
  },
  update(id: string | number, params: Backend.UserUpdateDto): Promise<Backend.UpdateUserRes> {
    return http.post('/user/update/' + id, params)
  },
  delete(id: string | number): Promise<Backend.RemoveUserRes> {
    return http.post('/user/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveUserRes> {
    return http.post('/user/batch/delete', { ids })
  },
  updateStatus(id: string | number, status: string): Promise<Backend.UpdateUserStatusRes> {
    return http.post('/user/updateStatus/' + id, { status })
  },
  adminResetPassword(
    params: Backend.AdminResetPasswordDto,
  ): Promise<Backend.AdminResetPasswordRes> {
    return http.post('/user/adminResetPassword', params)
  },
  resetPassword(params: Backend.ResetPasswordDto): Promise<Backend.ResetPasswordRes> {
    return http.post('/user/resetPassword', params)
  },
  // ---- Excel 模板 / 导入 / 导出 ----
  /** 下载导入模板(.xlsx) */
  downloadUserTemplate(config?: AxiosRequestConfig): Promise<FileResponse> {
    return http.post('/user/template', undefined, { responseType: 'blob', ...config })
  },
  /** 导入用户(部分成功语义:成功行已落库,失败行在 data.failedRows) */
  importUserFile(
    file: File,
  ): Promise<{ head: Backend.ResponseHeadDto; data: ExcelImportResult | null }> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/user/import', formData)
  },
  /** 按查询条件导出用户(查询条件走 query,与列表保持一致) */
  exportUser(params: Backend.UserPageDto, config?: AxiosRequestConfig): Promise<FileResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
    )
    return http.post('/user/export', undefined, {
      params: cleanParams,
      responseType: 'blob',
      ...config,
    })
  },
}
export default userApi
