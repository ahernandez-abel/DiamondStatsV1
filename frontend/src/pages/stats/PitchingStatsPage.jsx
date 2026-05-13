import { useEffect, useMemo, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getPitchingLeaders } from '../../api/leaders.api'

import './PitchingStatsPage.css'

function PitchingStatsPage() {

  const [leaders, setLeaders] = useState([])

  const [sortConfig, setSortConfig] = useState({
    key: 'era',
    direction: 'asc',
  })

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {

    try {

      const res = await getPitchingLeaders()

      setLeaders(res.data.leaders || [])

    } catch (error) {

      console.log(error)
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
    <PublicLayout>

      <section className="pitching-page">

        <div className="pitching-header">

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
                        src={
                          player.photo_url ||
                          'https://placehold.co/80x80'
                        }
                        alt={player.full_name}
                        className="pitcher-photo"
                      />

                      <div className="pitcher-name-box">

                        <span className="pitcher-name">
                          {player.full_name}
                        </span>

                        <span className="pitcher-team">
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
                      {player[column.key] || 0}
                    </td>

                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </PublicLayout>
  )
}

export default PitchingStatsPage