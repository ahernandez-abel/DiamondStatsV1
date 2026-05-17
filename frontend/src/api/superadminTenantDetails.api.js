import api from './axios'

export const getSuperadminTenantDetail = async (tenantId) => {
  return await api.get(`/superadmin/tenants/details/${tenantId}`)
}

export const updateSuperadminTenantPrivacy = async (
  tenantId,
  isPublic
) => {
  return await api.patch(
    `/superadmin/tenants/details/${tenantId}/privacy`,
    {
      is_public: isPublic,
    }
  )
}

export const regenerateSuperadminTenantAccessCode = async (tenantId) => {
  return await api.patch(
    `/superadmin/tenants/details/${tenantId}/access-code/regenerate`
  )
}

export const updateSuperadminTenantStatus = async (
  tenantId,
  status,
  suspensionReason = null
) => {
  return await api.patch(
    `/superadmin/tenants/details/${tenantId}/status`,
    {
      status,
      suspension_reason: suspensionReason,
    }
  )
}