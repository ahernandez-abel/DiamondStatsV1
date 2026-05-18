import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'

import { getPlayerById } from '../../api/players.api'

import Loader from '../../components/ui/Loader'
import PageHeader from '../../components/layout/PageHeader'

import './PlayerDetailsPage.css'

function PlayerDetailsPage() {
  const { tenantSlug, id } = useParams()

  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statSearch, setStatSearch] = useState('')

  useEffect(() => {
    loadPlayer()
  }, [tenantSlug, id])

  const loadPlayer = async () => {
    try {
      setLoading(true)

      const res = await getPlayerById(id, tenantSlug)

      setPlayer(res.data.player || null)
    } catch (error) {
      console.log(error)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }

  const formatAverage = (value) => {
    const number = Number(value || 0)

    return number
      .toFixed(3)
      .replace(/^0/, '')
  }

  const battingStats = useMemo(() => {
    if (!player) return []

    return [
      { key: 'AVG', label: 'AVG', value: formatAverage(player.batting?.avg), featured: true },
      { key: 'OPS', label: 'OPS', value: formatAverage(player.batting?.ops), featured: true },
      { key: 'OBP', label: 'OBP', value: formatAverage(player.batting?.obp) },
      { key: 'SLG', label: 'SLG', value: formatAverage(player.batting?.slg) },
      { key: 'AB', label: 'AB', value: player.batting?.ab || 0 },
      { key: 'H', label: 'H', value: player.batting?.hits || 0 },
      { key: 'HR', label: 'HR', value: player.batting?.hr || 0 },
      { key: 'RBI', label: 'RBI', value: player.batting?.rbi || 0 },
      { key: 'R', label: 'R', value: player.batting?.runs || 0 },
      { key: 'BB', label: 'BB', value: player.batting?.bb || 0 },
      { key: 'SO', label: 'SO', value: player.batting?.so || 0 },
      { key: 'SB', label: 'SB', value: player.batting?.sb || 0 },
    ]
  }, [player])

  const pitchingStats = useMemo(() => {
    if (!player) return []

    return [
      { key: 'ERA', label: 'ERA', value: player.pitching?.era || '0.00', featured: true },
      { key: 'WHIP', label: 'WHIP', value: player.pitching?.whip || '0.00', featured: true },
      { key: 'IP', label: 'IP', value: player.pitching?.ip || 0 },
      { key: 'SO', label: 'SO', value: player.pitching?.strikeouts || 0 },
      { key: 'BB', label: 'BB', value: player.pitching?.walks || 0 },
      { key: 'ER', label: 'ER', value: player.pitching?.earned_runs || 0 },
    ]
  }, [player])

  const filterStats = (stats) => {
    const query = statSearch.trim().toLowerCase()

    if (!query) return stats

    return stats.filter((stat) =>
      `${stat.key} ${stat.label}`.toLowerCase().includes(query)
    )
  }

  const filteredBattingStats = filterStats(battingStats)
  const filteredPitchingStats = filterStats(pitchingStats)

  if (loading) {
    return <Loader />
  }

  if (!player) {
    return (
      <PublicLayout tenantSlug={tenantSlug}>
        <div className="player-not-found">
          Jugador no encontrado
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <div className="player-details-page">
        <PageHeader
          title={player.full_name}
          subtitle={`${player.team_name || 'Agente Libre'} • ${player.position || '-'}`}
        />

        <div className="player-details-card">
          <div className="player-image-section">
            <div className="player-image-wrapper">
              <img
                src={
                  player.photo_url ||
                  'https://placehold.co/500x500?text=PLAYER'
                }
                alt={player.full_name}
                className="player-details-image"
              />

              <div className="player-jersey-number">
                #{player.jersey_number || '00'}
              </div>
            </div>
          </div>

          <div className="player-info-section">
            <div className="player-basic-header">
              <h1>{player.full_name}</h1>
              <p>{player.nickname || 'Sin apodo'}</p>
            </div>

            <div className="player-info-grid">
              <div className="info-card">
                <span className="info-label">Equipo</span>
                <h3 className="info-value">{player.team_name || '-'}</h3>
              </div>

              <div className="info-card">
                <span className="info-label">Posición</span>
                <h3 className="info-value highlight">
                  {player.position || '-'}
                </h3>
              </div>

              <div className="info-card">
                <span className="info-label">Batea</span>
                <h3 className="info-value">
                  {player.batting_hand || '-'}
                </h3>
              </div>

              <div className="info-card">
                <span className="info-label">Lanza</span>
                <h3 className="info-value">
                  {player.throwing_hand || '-'}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="player-stats-tools">
          <input
            type="text"
            value={statSearch}
            onChange={(e) => setStatSearch(e.target.value)}
            placeholder="Buscar estadística: AVG, HR, ERA, WHIP..."
            className="player-stat-search"
          />

          {statSearch && (
            <button
              type="button"
              onClick={() => setStatSearch('')}
              className="clear-stat-search-btn"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="stats-section">
          <div className="section-header">
            <h2 className="stats-title">
              Estadísticas Ofensivas
            </h2>
          </div>

          <div className="stats-grid compact">
            {filteredBattingStats.map((stat) => (
              <div
                key={`batting-${stat.key}`}
                className={stat.featured ? 'stat-card featured' : 'stat-card'}
              >
                <span>{stat.label}</span>
                <h3>{stat.value}</h3>
              </div>
            ))}
          </div>

          {filteredBattingStats.length === 0 && (
            <div className="stats-empty">
              No hay estadísticas ofensivas con ese filtro.
            </div>
          )}
        </div>

        <div className="stats-section">
          <h2 className="stats-title">
            Estadísticas de Pitcheo
          </h2>

          <div className="stats-grid compact">
            {filteredPitchingStats.map((stat) => (
              <div
                key={`pitching-${stat.key}`}
                className={stat.featured ? 'stat-card featured' : 'stat-card'}
              >
                <span>{stat.label}</span>
                <h3>{stat.value}</h3>
              </div>
            ))}
          </div>

          {filteredPitchingStats.length === 0 && (
            <div className="stats-empty">
              No hay estadísticas de pitcheo con ese filtro.
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export default PlayerDetailsPage