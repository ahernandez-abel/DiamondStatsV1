import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import {
  getSuperadminAlerts,
  markSuperadminAlertAsRead,
  resolveSuperadminAlert,
} from '../../api/superadminAnalytics.api'

import './SuperAdminAlertsPage.css'

function SuperAdminAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const res = await getSuperadminAlerts()
      setAlerts(res.data.alerts || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRead = async (alertId) => {
    try {
      await markSuperadminAlertAsRead(alertId)
      await loadAlerts()
    } catch (error) {
      console.log(error)
    }
  }

  const handleResolve = async (alertId) => {
    try {
      await resolveSuperadminAlert(alertId)
      await loadAlerts()
    } catch (error) {
      console.log(error)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Sin fecha'

    return new Date(date).toLocaleString('es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <SuperAdminLayout>
      <section className="superadmin-alerts-page">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Alertas internas
          </span>

          <h1>Centro de alertas</h1>

          <p>
            Revisa límites Free, pagos vencidos, tenants inactivos y señales
            comerciales importantes.
          </p>
        </div>

        {loading ? (
          <div className="superadmin-alerts-loading">
            Cargando alertas...
          </div>
        ) : alerts.length === 0 ? (
          <div className="superadmin-alerts-empty">
            <CheckCircle2 size={38} />

            <h3>No hay alertas registradas</h3>

            <p>
              Cuando el sistema detecte límites, vencimientos o inactividad,
              aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="superadmin-alerts-card">
            <div className="superadmin-alerts-card-header">
              <div>
                <h2>Alertas recientes</h2>

                <p>
                  Total de alertas: {alerts.length}
                </p>
              </div>

              <div className="superadmin-alerts-total">
                <Bell size={20} />
                {alerts.filter((alert) => !alert.is_resolved).length}
              </div>
            </div>

            <div className="superadmin-alerts-list">
              {alerts.map((alert) => (
                <article
                  key={alert.id}
                  className={`superadmin-alert-item ${alert.severity || 'info'} ${
                    alert.is_resolved ? 'resolved' : ''
                  }`}
                >
                  <div className="superadmin-alert-icon">
                    <AlertTriangle size={21} />
                  </div>

                  <div className="superadmin-alert-content">
                    <div className="superadmin-alert-top">
                      <div>
                        <h3>{alert.title}</h3>

                        <span className="superadmin-alert-type">
                          {alert.alert_type}
                        </span>
                      </div>

                      <span className="superadmin-alert-date">
                        <Clock size={15} />
                        {formatDate(alert.created_at)}
                      </span>
                    </div>

                    <p>{alert.message}</p>

                    <div className="superadmin-alert-meta">
                      <span>
                        Tenant: {alert.tenant_name || 'No disponible'}
                      </span>

                      <span>
                        Severidad: {alert.severity || 'info'}
                      </span>

                      <span>
                        {alert.is_read ? 'Leída' : 'No leída'}
                      </span>

                      <span>
                        {alert.is_resolved ? 'Resuelta' : 'Abierta'}
                      </span>
                    </div>

                    <div className="superadmin-alert-actions">
                      {!alert.is_read && (
                        <button
                          type="button"
                          onClick={() => handleRead(alert.id)}
                        >
                          <Eye size={16} />
                          Marcar leída
                        </button>
                      )}

                      {!alert.is_resolved && (
                        <button
                          type="button"
                          className="resolve"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle2 size={16} />
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default SuperAdminAlertsPage