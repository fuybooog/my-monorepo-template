import http from "@/api/http"

const userApi = {
  page(params) {
    return http.get('/user', params)
  }
}
export default userApi