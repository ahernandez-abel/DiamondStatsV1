import API from './axios'

export const getAdminDashboard = () => {
  return API.get('/admin/dashboard')
}