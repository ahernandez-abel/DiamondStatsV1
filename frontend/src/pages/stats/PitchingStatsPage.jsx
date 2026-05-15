import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'
import DashboardLayout from '../../layouts/DashboardLayout'

import { getPitchingLeaders } from '../../api/leaders.api'
import { getPublicHome } from '../../api/public.api'

import './PitchingStatsPage.css'

function PitchingStatsPage({ admin = false }) {
  const { tenantSlug } = useParams()

  const Layout = admin
    ? DashboardLayout
    : PublicLayout

  const [leaders, setLeaders] = useState([])
  const [tenant, setTenant] = useState(null)

  const [sortConfig, setSortConfig] = useState({
    key: 'era',
    direction: 'asc',
  })

  useEffect(() => {
    loadLeaders()
  }, [tenantSlug, admin])

  const loadLeaders = async () => {
    try {

      if (!admin && tenantSlug) {

        const publicRes = await getPublicHome(tenantSlug)

        setTenant(publicRes.data.tenant || null)

        const res = await getPitchingLeaders(tenantSlug)

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.leaders || []

        setLeaders(data)

        return
      }

      const res = await getPitchingLeaders()

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.leaders || []

      setTenant(null)

      setLeaders(data)

    } catch (error) {

      console.log(error)

      setLeaders([])
    }
  }

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'desc'
          ? 'asc'
          : 'desc',
    }))
  }

  const sortedLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => {

      const aValue = Number(a[sortConfig.key] || 0)
      const bValue = Number(b[sortConfig.key] || 0)

      if (sortConfig.direction === 'asc') {
        return aValue - bValue
      }

      return bValue - aValue
    })
  }, [leaders, sortConfig])

  const columns = [
    { key: 'era', label: 'ERA', highlight: true },
    { key: 'whip', label: 'WHIP' },
    { key: 'ip', label: 'IP' },
    { key: 'strikeouts', label: 'SO' },
    { key: 'walks', label: 'BB' },
    { key: 'hits_allowed', label: 'H' },
    { key: 'earned_runs', label: 'ER' },
    { key: 'runs_allowed', label: 'R' },
    { key: 'hr_allowed', label: 'HR' },
    { key: 'hbp', label: 'HBP' },
    { key: 'k_per_7', label: 'K/7' },
    { key: 'bb_per_7', label: 'BB/7' },
    { key: 'h_per_7', label: 'H/7' },
  ]

  return (
    <Layout tenantSlug={tenantSlug}>

      <section className="pitching-page">

        <div className="pitching-header">

          <span className="players-badge">
            {admin ? 'Panel Administrativo' : tenant?.name || 'DiamondStats'}
          </span>

          <h1 className="pitching-title">
            Líderes de Pitcheo
          </h1>

          <p className="pitching-subtitle">
            Estadísticas acumuladas de pitcheo
          </p>

        </div>

        <div className="pitching-table-wrapper">

          <table className="pitching-table">

            <thead>

              <tr>

                <th className="rank-column">
                  POS
                </th>

                <th className="pitcher-column">
                  LANZADOR
                </th>

                <th className="position-column">
                  POS
                </th>

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={column.highlight ? 'highlight-column' : ''}
                    onClick={() => handleSort(column.key)}
                  >

                    <span>

                      {column.label}

                      {sortConfig.key === column.key && (
                        <small>
                          {sortConfig.direction === 'desc' ? ' ↓' : ' ↑'}
                        </small>
                      )}

                    </span>

                  </th>
                ))}

              </tr>

            </thead>

            <tbody>

              {sortedLeaders.map((player, index) => (

                <tr key={player.id}>

                  <td className="rank-column">
                    {index + 1}
                  </td>

                  <td className="pitcher-column">

                    <div className="pitcher-info">

                      <img
                        src={player.photo_url || 'https://placehold.co/80x80'}
                        alt={player.full_name}
                        className="pitcher-photo"
                      />

                      <div className="pitcher-name-box">

                        <span className="pitcher-name">
                          {player.full_name}
                        </span>

                        <span className="pitcher-team">
                          {player.team_name || 'Sin equipo'}
                        </span>

                      </div>

                    </div>

                  </td>

                  <td className="position-column">
                    {player.position || '-'}
                  </td>

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.highlight ? 'highlight-column' : ''}
                    >
                      {player[column.key] || 0}
                    </td>
                  ))}

                </tr>

              ))}

              {sortedLeaders.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 3}>
                    No hay estadísticas de pitcheo registradas.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </Layout>
  )
}

export default PitchingStatsPage