import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import { getSuperadminAnalyticsOverview } from '../../api/superadminAnalytics.api'

import './SuperAdminDashboard.css'

function SuperAdminDashboard() {
  const [data, setData] = useState({
    overview: {},
    topTenants: [],
    inactiveTenants: [],
    monthlyGrowth: [],
    dailyActivity: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await getSuperadminAnalyticsOverview()

      setData({
        overview: res.data.overview || {},
        topTenants: res.data.topTenants || [],
        inactiveTenants: res.data.inactiveTenants || [],
        monthlyGrowth: res.data.monthlyGrowth || [],
        dailyActivity: res.data.dailyActivity || [],
      })
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const maxMonthlyGrowth = useMemo(() => {
    return Math.max(
      ...data.monthlyGrowth.map((item) => Number(item.total || 0)),
      1
    )
  }, [data.monthlyGrowth])

  const maxDailyActivity = useMemo(() => {
    return Math.max(
      ...data.dailyActivity.map((item) => Number(item.total || 0)),
      1
    )
  }, [data.dailyActivity])

  const maxTopTenantActivity = useMemo(() => {
    return Math.max(
      ...data.topTenants.map((item) => Number(item.activity_count || 0)),
      1
    )
  }, [data.topTenants])

  const overview = data.overview || {}

  const totalTenants = Number(overview.total_tenants || 0)
  const activeTenants = Number(overview.active_tenants || 0)
  const inactiveTenants = Number(overview.inactive_tenants || 0)
  const suspendedTenants = Number(overview.suspended_tenants || 0)

  const activePercent =
    totalTenants > 0
      ? Math.round((activeTenants / totalTenants) * 100)
      : 0

  const inactivePercent =
    totalTenants > 0
      ? Math.round((inactiveTenants / totalTenants) * 100)
      : 0

  const suspendedPercent =
    totalTenants > 0
      ? Math.round((suspendedTenants / totalTenants) * 100)
      : 0

  const formatDate = (date) => {
    if (!date) return 'Sin actividad'

    return new Date(date).toLocaleString('es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <SuperAdminLayout>
      <section className="superadmin-dashboard">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Panel global
          </span>

          <h1>Dashboard Superadmin</h1>

          <p>
            Control visual de tenants, crecimiento, actividad diaria y salud
            general de DiamondStats.
          </p>
        </div>

        {loading ? (
          <div className="superadmin-loading">
            Cargando métricas...
          </div>
        ) : (
          <>
            <div className="superadmin-stats-grid">
              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon green">
                  <Building2 size={26} />
                </div>

                <div>
                  <span>Tenants totales</span>
                  <strong>{overview.total_tenants || 0}</strong>
                </div>
              </div>

              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon blue">
                  <ShieldCheck size={26} />
                </div>

                <div>
                  <span>Tenants activos</span>
                  <strong>{overview.active_tenants || 0}</strong>
                </div>
              </div>

              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon cyan">
                  <Users size={26} />
                </div>

                <div>
                  <span>Usuarios</span>
                  <strong>{overview.total_users || 0}</strong>
                </div>
              </div>

              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon orange">
                  <Trophy size={26} />
                </div>

                <div>
                  <span>Equipos registrados</span>
                  <strong>{overview.total_teams || 0}</strong>
                </div>
              </div>

              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon purple">
                  <CalendarDays size={26} />
                </div>

                <div>
                  <span>Juegos</span>
                  <strong>{overview.total_games || 0}</strong>
                </div>
              </div>

              <div className="superadmin-stat-card">
                <div className="superadmin-stat-icon red">
                  <AlertTriangle size={26} />
                </div>

                <div>
                  <span>Alertas abiertas</span>
                  <strong>{overview.open_alerts || 0}</strong>
                </div>
              </div>
            </div>

            <div className="superadmin-analytics-grid">
              <div className="superadmin-chart-card">
                <div className="superadmin-chart-header">
                  <div>
                    <h2>Crecimiento mensual</h2>
                    <p>Tenants creados en los últimos 6 meses.</p>
                  </div>

                  <BarChart3 size={22} />
                </div>

                <div className="simple-bar-chart">
                  {data.monthlyGrowth.length === 0 ? (
                    <p className="chart-empty">
                      No hay datos suficientes.
                    </p>
                  ) : (
                    data.monthlyGrowth.map((item) => (
                      <div
                        className="simple-bar-row"
                        key={item.month}
                      >
                        <span>{item.month}</span>

                        <div className="simple-bar-track">
                          <div
                            className="simple-bar-fill"
                            style={{
                              width: `${Math.max(
                                (Number(item.total || 0) / maxMonthlyGrowth) * 100,
                                6
                              )}%`,
                            }}
                          ></div>
                        </div>

                        <strong>{item.total}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="superadmin-chart-card">
                <div className="superadmin-chart-header">
                  <div>
                    <h2>Actividad diaria</h2>
                    <p>Uso registrado durante los últimos 7 días.</p>
                  </div>

                  <Activity size={22} />
                </div>

                <div className="vertical-chart">
                  {data.dailyActivity.length === 0 ? (
                    <p className="chart-empty">
                      No hay actividad reciente.
                    </p>
                  ) : (
                    data.dailyActivity.map((item) => (
                      <div
                        className="vertical-chart-item"
                        key={item.day}
                      >
                        <div className="vertical-chart-bar-wrap">
                          <div
                            className="vertical-chart-bar"
                            style={{
                              height: `${Math.max(
                                (Number(item.total || 0) / maxDailyActivity) * 100,
                                8
                              )}%`,
                            }}
                          ></div>
                        </div>

                        <strong>{item.total}</strong>
                        <span>{item.day}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="superadmin-chart-card">
                <div className="superadmin-chart-header">
                  <div>
                    <h2>Tenants activos vs inactivos</h2>
                    <p>Estado general de los clientes registrados.</p>
                  </div>

                  <ShieldCheck size={22} />
                </div>

                <div className="tenant-status-visual">
                  <div className="tenant-status-bar">
                    <div
                      className="tenant-status-active"
                      style={{ width: `${activePercent}%` }}
                    ></div>

                    <div
                      className="tenant-status-inactive"
                      style={{ width: `${inactivePercent}%` }}
                    ></div>

                    <div
                      className="tenant-status-suspended"
                      style={{ width: `${suspendedPercent}%` }}
                    ></div>
                  </div>

                  <div className="tenant-status-list">
                    <div>
                      <span className="dot active"></span>
                      Activos
                      <strong>{activeTenants}</strong>
                    </div>

                    <div>
                      <span className="dot inactive"></span>
                      Inactivos
                      <strong>{inactiveTenants}</strong>
                    </div>

                    <div>
                      <span className="dot suspended"></span>
                      Suspendidos
                      <strong>{suspendedTenants}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="superadmin-chart-card">
                <div className="superadmin-chart-header">
                  <div>
                    <h2>Top tenants por uso</h2>
                    <p>Equipos con más actividad registrada.</p>
                  </div>

                  <Building2 size={22} />
                </div>

                <div className="top-tenants-list">
                  {data.topTenants.length === 0 ? (
                    <p className="chart-empty">
                      No hay actividad registrada.
                    </p>
                  ) : (
                    data.topTenants.map((tenant, index) => (
                      <article key={tenant.id}>
                        <div className="top-tenant-rank">
                          #{index + 1}
                        </div>

                        <div className="top-tenant-info">
                          <strong>{tenant.name}</strong>
                          <span>/{tenant.slug}</span>

                          <div className="top-tenant-track">
                            <div
                              style={{
                                width: `${Math.max(
                                  (Number(tenant.activity_count || 0) /
                                    maxTopTenantActivity) *
                                    100,
                                  6
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="top-tenant-total">
                          {tenant.activity_count}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="superadmin-inactive-card">
              <div className="superadmin-chart-header">
                <div>
                  <h2>Tenants inactivos</h2>
                  <p>Equipos activos sin uso reciente o sin actividad registrada.</p>
                </div>

                <AlertTriangle size={22} />
              </div>

              {data.inactiveTenants.length === 0 ? (
                <p className="chart-empty">
                  No hay tenants inactivos detectados.
                </p>
              ) : (
                <div className="inactive-tenants-list">
                  {data.inactiveTenants.map((tenant) => (
                    <article key={tenant.id}>
                      <div>
                        <strong>{tenant.name}</strong>
                        <span>/{tenant.slug}</span>
                      </div>

                      <p>{formatDate(tenant.last_activity_at)}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default SuperAdminDashboard