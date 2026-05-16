import { useEffect, useState } from 'react'
import {
  Building2,
  ShieldCheck,
  Users,
  Trophy,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import { getSuperAdminStats } from '../../api/superadmin.api'

import './SuperAdminDashboard.css'

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_tenants: 0,
    active_tenants: 0,
    total_users: 0,
    total_teams: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getSuperAdminStats()
      setStats(res.data.stats || {})
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
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
            Control general de tenants, equipos, usuarios y actividad de DiamondStats.
          </p>
        </div>

        {loading ? (
          <div className="superadmin-loading">
            Cargando métricas...
          </div>
        ) : (
          <div className="superadmin-stats-grid">
            <div className="superadmin-stat-card">
              <div className="superadmin-stat-icon green">
                <Building2 size={26} />
              </div>

              <div>
                <span>Tenants totales</span>
                <strong>{stats.total_tenants}</strong>
              </div>
            </div>

            <div className="superadmin-stat-card">
              <div className="superadmin-stat-icon blue">
                <ShieldCheck size={26} />
              </div>

              <div>
                <span>Tenants activos</span>
                <strong>{stats.active_tenants}</strong>
              </div>
            </div>

            <div className="superadmin-stat-card">
              <div className="superadmin-stat-icon cyan">
                <Users size={26} />
              </div>

              <div>
                <span>Usuarios</span>
                <strong>{stats.total_users}</strong>
              </div>
            </div>

            <div className="superadmin-stat-card">
              <div className="superadmin-stat-icon orange">
                <Trophy size={26} />
              </div>

              <div>
                <span>Equipos registrados</span>
                <strong>{stats.total_teams}</strong>
              </div>
            </div>
          </div>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default SuperAdminDashboard