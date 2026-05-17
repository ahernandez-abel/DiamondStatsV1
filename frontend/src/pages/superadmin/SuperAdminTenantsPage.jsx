import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Eye,
  RefreshCcw,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'

import {
  getAllTenants,
  updateTenantPlan,
  updateTenantStatus,
} from '../../api/superadmin.api'

import './SuperAdminTenantsPage.css'

function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)

      const res = await getAllTenants()

      setTenants(res.data.tenants || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (tenantId, status) => {
    try {
      await updateTenantStatus(tenantId, { status })
      await loadTenants()
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangePlan = async (tenantId, plan) => {
    try {
      await updateTenantPlan(tenantId, { plan })
      await loadTenants()
    } catch (error) {
      console.log(error)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  return (
    <SuperAdminLayout>
      <section className="superadmin-tenants-page">
        <div className="superadmin-page-header tenants-header">
          <div>
            <span className="superadmin-page-badge">
              Gestión global
            </span>

            <h1>Tenants</h1>

            <p>
              Administra los clientes/equipos principales registrados en DiamondStats.
            </p>
          </div>

          <button
            type="button"
            className="tenants-refresh-btn"
            onClick={loadTenants}
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="superadmin-loading">
            Cargando tenants...
          </div>
        ) : tenants.length === 0 ? (
          <div className="tenants-empty">
            <Building2 size={42} />

            <h3>No hay tenants registrados</h3>

            <p>
              Cuando registres equipos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="tenants-table-card">
            <div className="tenants-table-wrapper">
              <table className="tenants-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Visibilidad</th>
                    <th>Usuarios</th>
                    <th>Equipos</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div className="tenant-name-cell">
                          <div className="tenant-avatar">
                            {tenant.logo_url ? (
                              <img
                                src={tenant.logo_url}
                                alt={tenant.name}
                              />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>

                          <div>
                            <strong>{tenant.name}</strong>
                            <span>ID: {tenant.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <code>{tenant.slug}</code>
                      </td>

                      <td>
                        <select
                          value={tenant.plan || tenant.plan_slug || 'free'}
                          onChange={(e) =>
                            handleChangePlan(
                              tenant.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>

                      <td>
                        <select
                          value={tenant.status || 'active'}
                          onChange={(e) =>
                            handleChangeStatus(
                              tenant.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                          <option value="suspended">Suspendido</option>
                        </select>
                      </td>

                      <td>
                        <span
                          className={
                            tenant.is_public
                              ? 'tenant-pill public'
                              : 'tenant-pill private'
                          }
                        >
                          {tenant.is_public ? 'Público' : 'Privado'}
                        </span>
                      </td>

                      <td>{tenant.total_users || 0}</td>

                      <td>{tenant.total_teams || 0}</td>

                      <td>{formatDate(tenant.created_at)}</td>

                      <td>
                        <Link
                          to={`/superadmin/tenant/${tenant.id}`}
                          className="tenant-detail-link"
                        >
                          <Eye size={16} />
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default SuperAdminTenantsPage