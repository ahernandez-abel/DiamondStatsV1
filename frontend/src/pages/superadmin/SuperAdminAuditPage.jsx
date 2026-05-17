import { useEffect, useState } from 'react'
import {
  ClipboardList,
  Clock,
  Database,
  ShieldCheck,
  User,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import { getSuperadminAuditLogs } from '../../api/superadminAnalytics.api'

import './SuperAdminAuditPage.css'

function SuperAdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      const res = await getSuperadminAuditLogs()
      setAuditLogs(res.data.auditLogs || [])
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
      <section className="superadmin-audit-page">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Auditoría
          </span>

          <h1>Registro de auditoría</h1>

          <p>
            Consulta quién realizó acciones importantes dentro de cada tenant.
          </p>
        </div>

        {loading ? (
          <div className="superadmin-audit-loading">
            Cargando auditoría...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="superadmin-audit-empty">
            <ShieldCheck size={36} />

            <h3>No hay auditoría registrada</h3>

            <p>
              Cuando se creen jugadores, juegos, estadísticas o cambios
              administrativos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="superadmin-audit-card">
            <div className="superadmin-audit-card-header">
              <div>
                <h2>Eventos recientes</h2>

                <p>
                  Últimos {auditLogs.length} registros de auditoría.
                </p>
              </div>

              <div className="superadmin-audit-total">
                <ClipboardList size={20} />
                {auditLogs.length}
              </div>
            </div>

            <div className="superadmin-audit-list">
              {auditLogs.map((item) => (
                <article
                  key={item.id}
                  className="superadmin-audit-item"
                >
                  <div className="superadmin-audit-icon">
                    <ClipboardList size={20} />
                  </div>

                  <div className="superadmin-audit-content">
                    <div className="superadmin-audit-top">
                      <div>
                        <h3>{item.action || 'Acción'}</h3>

                        <span className="superadmin-audit-module">
                          <Database size={14} />
                          {item.module || 'Módulo no definido'}
                        </span>
                      </div>

                      <span className="superadmin-audit-date">
                        <Clock size={15} />
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <p>
                      {item.description || 'Sin descripción registrada'}
                    </p>

                    <div className="superadmin-audit-meta">
                      <span>
                        Tenant: {item.tenant_name || 'No disponible'}
                      </span>

                      <span>
                        <User size={15} />
                        {item.user_name || item.user_email || 'Usuario no disponible'}
                      </span>

                      {item.entity_type && (
                        <span>
                          Entidad: {item.entity_type}
                          {item.entity_id ? ` #${item.entity_id}` : ''}
                        </span>
                      )}

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

export default SuperAdminAuditPage