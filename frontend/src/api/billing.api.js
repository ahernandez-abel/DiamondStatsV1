import api from './axios'

export const getBillingPlans = async () => {
  return await api.get('/billing/plans')
}

export const createBillingPlan = async (data) => {
  return await api.post('/billing/plans', data)
}

export const updateBillingPlan = async (planId, data) => {
  return await api.patch(`/billing/plans/${planId}`, data)
}

export const getBillingTenants = async () => {
  return await api.get('/billing/tenants')
}

export const changeTenantPlan = async (tenantId, data) => {
  return await api.patch(`/billing/tenants/${tenantId}/plan`, data)
}

export const registerManualPayment = async (tenantId, data) => {
  return await api.post(`/billing/tenants/${tenantId}/payments`, data)
}

export const getTenantPayments = async (tenantId) => {
  return await api.get(`/billing/tenants/${tenantId}/payments`)
}