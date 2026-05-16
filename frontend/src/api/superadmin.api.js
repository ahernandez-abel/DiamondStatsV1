import api from './axios';

export const getSuperAdminStats = async () => {
  return await api.get('/superadmin/stats');
};

export const getAllTenants = async () => {
  return await api.get('/superadmin/tenants');
};

export const createTenantManual = async (data) => {
  return await api.post('/superadmin/tenants', data);
};

export const updateTenantStatus = async (tenantId, data) => {
  return await api.patch(
    `/superadmin/tenants/${tenantId}/status`,
    data
  );
};

export const updateTenantPlan = async (tenantId, data) => {
  return await api.patch(
    `/superadmin/tenants/${tenantId}/plan`,
    data
  );
};