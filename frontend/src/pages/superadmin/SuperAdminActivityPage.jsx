import { useEffect, useState } from 'react'
import {
  Activity,
  Building2,
  Clock,
  MonitorCheck,
  User,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import { getSuperadminActivity } from '../../api/superadminAnalytics.api'

import './SuperAdminActivityPage.css'

function SuperAdminActivityPage() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivity()
  }, [])

  const loadActivity = async () => {
    try {
      const res = await getSuperadminActivity()
      setActivity(res.data.activity || [])
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

  return (
    <SuperAdminLayout>
      <section className="superadmin-activity-page">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Control de uso
          </span>

          <h1>Actividad de tenants</h1>

          <p>
            Visualiza las acciones recientes realizadas por los equipos dentro
            de DiamondStats.
          </p>
        </div>

        {loading ? (
          <div className="superadmin-activity-loading">
            Cargando actividad...
          </div>
        ) : activity.length === 0 ? (
          <div className="superadmin-activity-empty">
            <MonitorCheck size={34} />

            <h3>No hay actividad registrada</h3>

            <p>
              Cuando los admins usen el sistema, la actividad aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="superadmin-activity-card">
            <div className="superadmin-activity-card-header">
              <div>
                <h2>Actividad reciente</h2>

                <p>
                  Últimos {activity.length} movimientos registrados.
                </p>
              </div>

              <div className="superadmin-activity-total">
                <Activity size={20} />
                {activity.length}
              </div>
            </div>

            <div className="superadmin-activity-list">
              {activity.map((item) => (
                <article
                  key={item.id}
                  className="superadmin-activity-item"
                >
                  <div className="superadmin-activity-icon">
                    <Activity size={20} />
                  </div>

                  <div className="superadmin-activity-content">
                    <div className="superadmin-activity-top">
                      <h3>
                        {item.activity_type || 'Actividad'}
                      </h3>

                      <span>
                        <Clock size={15} />
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <p>
                      {item.description || 'Sin descripción'}
                    </p>

                    <div className="superadmin-activity-meta">
                      <span>
                        <Building2 size={15} />
                        {item.tenant_name || 'Tenant no disponible'}
                      </span>

                      <span>
                        <User size={15} />
                        {item.user_name || item.user_email || 'Usuario no disponible'}
                      </span>

                      {item.ip_address && (
                        <span>
                          IP: {item.ip_address}
                        </span>
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

export default SuperAdminActivityPage