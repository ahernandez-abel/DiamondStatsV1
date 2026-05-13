import { useEffect, useMemo, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getBattingLeaders } from '../../api/leaders.api'

import './BattingStatsPage.css'

function BattingStatsPage() {

  const [leaders, setLeaders] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: 'avg',
    direction: 'desc',
  })

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {
    try {
      const res = await getBattingLeaders()
      setLeaders(res.data.leaders || [])
    } catch (error) {
      console.log(error)
    }
  }

  const formatDecimal = (value) => {
    const number = Number(value || 0)

    return number
      .toFixed(3)
      .replace(/^0/, '')
  }

  const formatStat = (key, value) => {
    if (['avg', 'obp', 'slg', 'ops'].includes(key)) {
      return formatDecimal(value)
    }

    return value || 0
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
    { key: 'games_played', label: 'GP' },
    { key: 'ab', label: 'AB' },
    { key: 'runs', label: 'R' },
    { key: 'h', label: 'H' },
    { key: 'avg', label: 'AVG', highlight: true },
    { key: 'doubles', label: '2B' },
    { key: 'triples', label: '3B' },
    { key: 'hr', label: 'HR' },
    { key: 'rbi', label: 'RBI' },
    { key: 'tb', label: 'TB' },
    { key: 'bb', label: 'BB' },
    { key: 'so', label: 'K' },
    { key: 'sb', label: 'SB' },
    { key: 'obp', label: 'OBP' },
    { key: 'slg', label: 'SLG' },
    { key: 'ops', label: 'OPS' },
  ]

  return (
    <PublicLayout>

      <section className="batting-page">

        <div className="batting-header">

          <h1 className="batting-title">
            Líderes Ofensivos
          </h1>

          <p className="batting-subtitle">
            Estadísticas acumuladas de bateo
          </p>

        </div>

        <div className="batting-table-wrapper">

          <table className="batting-table">

            <thead>
              <tr>

                <th className="rank-column">
                  POS
                </th>

                <th className="player-column">
                  NOMBRE
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

                    <div className="player-table-info">

                      <img
                        src={
                          player.photo_url ||
                          'https://placehold.co/80x80'
                        }
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

            </tbody>

          </table>

        </div>

      </section>

    </PublicLayout>
  )
}

export default BattingStatsPage