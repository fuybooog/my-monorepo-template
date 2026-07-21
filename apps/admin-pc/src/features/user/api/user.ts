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
}
export default userApi
