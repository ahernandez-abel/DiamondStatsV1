import { useEffect, useState } from 'react'
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

        <div className="stats-section">
          <div className="section-header">
            <h2 className="stats-title">
              Estadísticas Ofensivas
            </h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card featured">
              <span>AVG</span>
              <h3>{formatAverage(player.batting?.avg)}</h3>
            </div>

            <div className="stat-card">
              <span>OPS</span>
              <h3>{formatAverage(player.batting?.ops)}</h3>
            </div>

            <div className="stat-card">
              <span>OBP</span>
              <h3>{formatAverage(player.batting?.obp)}</h3>
            </div>

            <div className="stat-card">
              <span>SLG</span>
              <h3>{formatAverage(player.batting?.slg)}</h3>
            </div>

            <div className="stat-card">
              <span>H</span>
              <h3>{player.batting?.hits || 0}</h3>
            </div>

            <div className="stat-card">
              <span>HR</span>
              <h3>{player.batting?.hr || 0}</h3>
            </div>

            <div className="stat-card">
              <span>RBI</span>
              <h3>{player.batting?.rbi || 0}</h3>
            </div>

            <div className="stat-card">
              <span>R</span>
              <h3>{player.batting?.runs || 0}</h3>
            </div>

            <div className="stat-card">
              <span>AB</span>
              <h3>{player.batting?.ab || 0}</h3>
            </div>

            <div className="stat-card">
              <span>BB</span>
              <h3>{player.batting?.bb || 0}</h3>
            </div>

            <div className="stat-card">
              <span>SO</span>
              <h3>{player.batting?.so || 0}</h3>
            </div>

            <div className="stat-card">
              <span>SB</span>
              <h3>{player.batting?.sb || 0}</h3>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2 className="stats-title">
            Estadísticas de Pitcheo
          </h2>

          <div className="stats-grid">
            <div className="stat-card featured">
              <span>ERA</span>
              <h3>{player.pitching?.era || '0.00'}</h3>
            </div>

            <div className="stat-card">
              <span>WHIP</span>
              <h3>{player.pitching?.whip || '0.00'}</h3>
            </div>

            <div className="stat-card">
              <span>IP</span>
              <h3>{player.pitching?.ip || 0}</h3>
            </div>

            <div className="stat-card">
              <span>SO</span>
              <h3>{player.pitching?.strikeouts || 0}</h3>
            </div>

            <div className="stat-card">
              <span>BB</span>
              <h3>{player.pitching?.walks || 0}</h3>
            </div>

            <div className="stat-card">
              <span>ER</span>
              <h3>{player.pitching?.earned_runs || 0}</h3>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2 className="stats-title">
            Estadísticas Defensivas
          </h2>

          <div className="stats-grid">
            <div className="stat-card featured">
              <span>FLD%</span>
              <h3>{formatAverage(player.fielding?.fielding_pct)}</h3>
            </div>

            <div className="stat-card">
              <span>PO</span>
              <h3>{player.fielding?.putouts || 0}</h3>
            </div>

            <div className="stat-card">
              <span>AST</span>
              <h3>{player.fielding?.assists || 0}</h3>
            </div>

            <div className="stat-card">
              <span>ERR</span>
              <h3>{player.fielding?.errors || 0}</h3>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default PlayerDetailsPage