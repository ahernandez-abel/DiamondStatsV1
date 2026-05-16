import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import api from '../api/axios'

function PublicTenantRoute({ children }) {
  const { tenantSlug } = useParams()

  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    validateAccess()
  }, [tenantSlug])

  const validateAccess = async () => {
    try {
      setLoading(true)

      const homeRes = await api.get(`/public/${tenantSlug}/home`)
      const tenant = homeRes.data?.tenant

      if (!tenant) {
        setAllowed(false)
        return
      }

      if (tenant.is_public) {
        setAllowed(true)
        return
      }

      const savedCode = localStorage.getItem(`tenant_access_${tenantSlug}`)

      if (!savedCode) {
        setAllowed(false)
        return
      }

      const accessRes = await api.get(`/public/team-access/${savedCode}`)

      if (accessRes.data?.tenant?.slug === tenantSlug) {
        setAllowed(true)
        return
      }

      localStorage.removeItem(`tenant_access_${tenantSlug}`)
      setAllowed(false)
    } catch (error) {
      console.log(error)
      setAllowed(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#020617',
          color: '#fff',
          fontWeight: 800,
        }}
      >
        Validando acceso...
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/team-access" replace />
  }

  return children
}

export default PublicTenantRoute