import http from '@/api/http'
import { Backend } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

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
}
export default userApi
