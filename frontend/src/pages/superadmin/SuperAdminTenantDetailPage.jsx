import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import {
  getSuperadminTenantDetail,
  regenerateSuperadminTenantAccessCode,
  updateSuperadminTenantPrivacy,
  updateSuperadminTenantStatus,
} from '../../api/superadminTenantDetails.api'

import './SuperAdminTenantDetailPage.css'

function SuperAdminTenantDetailPage() {
  const { tenantId } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadTenantDetail()
  }, [tenantId])

  const loadTenantDetail = async () => {
    try {
      const res = await getSuperadminTenantDetail(tenantId)
      setData(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Sin fecha'

    return new Date(date).toLocaleString('es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handlePrivacy = async () => {
    try {
      setActionLoading(true)

      await updateSuperadminTenantPrivacy(
        tenantId,
        !data.tenant.is_public
      )

      await loadTenantDetail()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRegenerateCode = async () => {
    try {
      setActionLoading(true)
      await regenerateSuperadminTenantAccessCode(tenantId)
      await loadTenantDetail()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatus = async (status) => {
    try {
      setActionLoading(true)

      const reason =
        status === 'suspended'
          ? 'Suspendido desde el panel del superadmin'
          : null

      await updateSuperadminTenantStatus(tenantId, status, reason)
      await loadTenantDetail()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="superadmin-tenant-detail-loading">
          Cargando detalle del tenant...
        </div>
      </SuperAdminLayout>
    )
  }

  if (!data?.tenant) {
    return (
      <SuperAdminLayout>
        <div className="superadmin-tenant-detail-loading">
          Tenant no encontrado.
        </div>
      </SuperAdminLayout>
    )
  }

  const { tenant, users, payments, alerts, recentActivity } = data

  return (
    <SuperAdminLayout>
      <section className="superadmin-tenant-detail-page">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Gestión avanzada
          </span>

          <h1>{tenant.name}</h1>

          <p>
            Control completo del tenant, plan, acceso, pagos, usuarios,
            actividad y alertas internas.
          </p>
        </div>

        <div className="tenant-detail-main-card">
          <div className="tenant-detail-main-info">
            <div className="tenant-detail-logo">
              <Building2 size={34} />
            </div>

            <div>
              <h2>{tenant.name}</h2>

              <p>
                /{tenant.slug}
              </p>

              <div className="tenant-detail-badges">
                <span className={`status ${tenant.status}`}>
                  {tenant.status}
                </span>

                <span>
                  {tenant.is_public ? 'Público' : 'Privado'}
                </span>

                <span>
                  Plan: {tenant.plan_name || 'Sin plan'}
                </span>
              </div>
            </div>
          </div>

          <div className="tenant-detail-actions">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePrivacy}
            >
              {tenant.is_public ? <EyeOff size={17} /> : <Eye size={17} />}
              {tenant.is_public ? 'Hacer privado' : 'Hacer público'}
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRegenerateCode}
            >
              <RefreshCcw size={17} />
              Regenerar código
            </button>

            {tenant.status === 'suspended' ? (
              <button
                type="button"
                disabled={actionLoading}
                className="success"
                onClick={() => handleStatus('active')}
              >
                <ShieldCheck size={17} />
                Activar
              </button>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                className="danger"
                onClick={() => handleStatus('suspended')}
              >
                <ShieldAlert size={17} />
                Suspender
              </button>
            )}
          </div>
        </div>

        <div className="tenant-detail-stats-grid">
          <div className="tenant-detail-stat-card">
            <Users size={24} />
            <span>Jugadores</span>
            <strong>{tenant.total_players || 0}</strong>
          </div>

          <div className="tenant-detail-stat-card">
            <CalendarDays size={24} />
            <span>Juegos</span>
            <strong>{tenant.total_games || 0}</strong>
          </div>

          <div className="tenant-detail-stat-card">
            <ClipboardList size={24} />
            <span>Estadísticas</span>
            <strong>{tenant.total_stats || 0}</strong>
          </div>

          <div className="tenant-detail-stat-card">
            <Building2 size={24} />
            <span>Equipos rivales</span>
            <strong>{tenant.total_rival_teams || 0}</strong>
          </div>
        </div>

        <div className="tenant-detail-grid">
          <div className="tenant-detail-panel">
            <div className="tenant-detail-panel-header">
              <h3>Información del plan</h3>
              <CreditCard size={20} />
            </div>

            <div className="tenant-detail-info-list">
              <p>
                <span>Plan</span>
                <strong>{tenant.plan_name || 'Sin plan'}</strong>
              </p>

              <p>
                <span>Precio</span>
                <strong>
                  {tenant.price_monthly
                    ? `${tenant.currency || 'USD'} ${tenant.price_monthly}`
                    : 'No definido'}
                </strong>
              </p>

              <p>
                <span>Suscripción</span>
                <strong>{tenant.subscription_status || 'Sin estado'}</strong>
              </p>

              <p>
                <span>Vence</span>
                <strong>{formatDate(tenant.expires_at)}</strong>
              </p>
            </div>
          </div>

          <div className="tenant-detail-panel">
            <div className="tenant-detail-panel-header">
              <h3>Acceso privado</h3>
              <KeyRound size={20} />
            </div>

            <div className="tenant-detail-access-code">
              {tenant.access_code || 'Sin código'}
            </div>

            <p className="tenant-detail-small-text">
              Este código se entrega al equipo cuando el tenant está privado.
            </p>
          </div>

          <div className="tenant-detail-panel">
            <div className="tenant-detail-panel-header">
              <h3>Última actividad</h3>
              <Activity size={20} />
            </div>

            <div className="tenant-detail-info-list">
              <p>
                <span>Último login</span>
                <strong>{formatDate(tenant.last_login_at)}</strong>
              </p>

              <p>
                <span>Último uso</span>
                <strong>{formatDate(tenant.last_activity_at)}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="tenant-detail-section">
          <div className="tenant-detail-section-header">
            <h2>Usuarios del tenant</h2>
            <span>{users?.length || 0}</span>
          </div>

          <div className="tenant-detail-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Última actividad</th>
                </tr>
              </thead>

              <tbody>
                {(users || []).map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.is_active ? 'Activo' : 'Inactivo'}</td>
                    <td>{formatDate(user.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tenant-detail-section">
          <div className="tenant-detail-section-header">
            <h2>Pagos recientes</h2>
            <span>{payments?.length || 0}</span>
          </div>

          <div className="tenant-detail-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Fecha pago</th>
                  <th>Registrado por</th>
                </tr>
              </thead>

              <tbody>
                {(payments || []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.plan_name || 'N/A'}</td>
                    <td>
                      {payment.currency || 'USD'} {payment.amount || 0}
                    </td>
                    <td>{payment.payment_method || 'N/A'}</td>
                    <td>{formatDate(payment.paid_at)}</td>
                    <td>{payment.created_by_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tenant-detail-two-columns">
          <div className="tenant-detail-section">
            <div className="tenant-detail-section-header">
              <h2>Alertas</h2>
              <span>{alerts?.length || 0}</span>
            </div>

            <div className="tenant-detail-mini-list">
              {(alerts || []).length === 0 ? (
                <p className="tenant-detail-empty-text">
                  No hay alertas para este tenant.
                </p>
              ) : (
                alerts.map((alert) => (
                  <article key={alert.id}>
                    <AlertTriangle size={18} />
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.message}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="tenant-detail-section">
            <div className="tenant-detail-section-header">
              <h2>Actividad reciente</h2>
              <span>{recentActivity?.length || 0}</span>
            </div>

            <div className="tenant-detail-mini-list">
              {(recentActivity || []).length === 0 ? (
                <p className="tenant-detail-empty-text">
                  No hay actividad reciente.
                </p>
              ) : (
                recentActivity.map((item) => (
                  <article key={item.id}>
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>{item.activity_type}</strong>
                      <p>
                        {item.description} · {formatDate(item.created_at)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </SuperAdminLayout>
  )
}

export default SuperAdminTenantDetailPage