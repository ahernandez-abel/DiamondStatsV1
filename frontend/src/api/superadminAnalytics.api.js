import api from './axios'

export const getSuperadminAnalyticsOverview = async () => {
  return await api.get('/superadmin/analytics/overview')
}

export const getSuperadminActivity = async () => {
  return await api.get('/superadmin/analytics/activity')
}

export const getSuperadminAuditLogs = async () => {
  return await api.get('/superadmin/analytics/audit')
}

export const getSuperadminAlerts = async () => {
  return await api.get('/superadmin/analytics/alerts')
}

export const markSuperadminAlertAsRead = async (alertId) => {
  return await api.patch(`/superadmin/analytics/alerts/${alertId}/read`)
}

export const resolveSuperadminAlert = async (alertId) => {
  return await api.patch(`/superadmin/analytics/alerts/${alertId}/resolve`)
}

export const getSuperadminCommercialControl = async () => {
  return await api.get('/superadmin/analytics/commercial')
}

export const getSuperadminSystemHealth = async () => {
  return await api.get('/superadmin/analytics/health')
}