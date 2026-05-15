import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'

import { getFieldingLeaders } from '../../api/leaders.api'

import './FieldingStatsPage.css'

function FieldingStatsPage() {
  const { tenantSlug } = useParams()

  const [leaders, setLeaders] = useState([])

  const [sortConfig, setSortConfig] = useState({
    key: 'fielding_pct',
    direction: 'desc',
  })

  useEffect(() => {
    loadLeaders()
  }, [tenantSlug])

  const loadLeaders = async () => {
    try {
      const res = await getFieldingLeaders(tenantSlug)

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.leaders || []

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

  const formatDecimal = (value) => {
    const number = Number(value || 0)

    return number
      .toFixed(3)
      .replace(/^0/, '')
  }

  const formatStat = (key, value) => {
    if (key === 'fielding_pct' || key === 'range_factor') {
      return formatDecimal(value)
    }

    return value || 0
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
    { key: 'fielding_pct', label: 'FLD%', highlight: true },
    { key: 'putouts', label: 'PO' },
    { key: 'assists', label: 'AST' },
    { key: 'errors', label: 'ERR' },
    { key: 'passed_balls', label: 'PB' },
    { key: 'total_chances', label: 'TC' },
    { key: 'range_factor', label: 'RF' },
  ]

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <section className="fielding-page">
        <div className="fielding-header">
          <h1 className="fielding-title">
            Líderes Defensivos
          </h1>

          <p className="fielding-subtitle">
            Estadísticas acumuladas defensivas
          </p>
        </div>

        <div className="fielding-table-wrapper">
          <table className="fielding-table">
            <thead>
              <tr>
                <th className="rank-column">
                  POS
                </th>

                <th className="player-column">
                  JUGADOR
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

                  <td className="player-column">
                    <div className="player-info">
                      <img
                        src={player.photo_url || 'https://placehold.co/80x80'}
                        alt={player.full_name}
                        className="player-photo"
                      />

                      <div className="player-name-box">
                        <span className="player-name">
                          {player.full_name}
                        </span>

                        <span className="player-team">
                          {player.team_name || ''}
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
                      {formatStat(column.key, player[column.key])}
                    </td>
                  ))}
                </tr>
              ))}

              {sortedLeaders.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 3} className="empty-row">
                    No hay estadísticas defensivas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PublicLayout>
  )
}

export default FieldingStatsPage