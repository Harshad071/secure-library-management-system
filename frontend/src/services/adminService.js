import api from './api'

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats')
  return {
    ...response.data,
    recentActivity: Array.isArray(response.data?.recentActivity) ? response.data.recentActivity : [],
  }
}

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return {
    ...response.data,
    recentActivity: Array.isArray(response.data?.recentActivity) ? response.data.recentActivity : [],
  }
}

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users')
  return Array.isArray(response.data) ? response.data : []
}
