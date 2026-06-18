import authApi from "@/features/auth/api/auth"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"

export function LayoutTop() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore(state => state.clearAuth)
  async function handleLogout() {
    await authApi.logout()
    clearAuth()
    navigate('/login', {replace: true})
  }
  return (
    <div>
      <div>logo</div>
      <div><button onClick={handleLogout}>退出</button></div>
    </div>
  )
}