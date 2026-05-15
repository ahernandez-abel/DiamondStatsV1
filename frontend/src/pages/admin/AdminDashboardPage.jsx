import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import DashboardLayout from '../../layouts/DashboardLayout'
import Loader from '../../components/ui/Loader'

import { getAdminDashboard } from '../../api/dashboard.api'

import './AdminDashboardPage.css'

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await getAdminDashboard()
      setDashboard(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  const tenant = dashboard?.tenant
  const totals = dashboard?.totals || {}
  const recentGames = dashboard?.recentGames || []
  const topBatters = dashboard?.topBatters || []
  const topPitchers = dashboard?.topPitchers || []

  return (
    <DashboardLayout>
      <section className="admin-dashboard-page">
        <div className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-kicker">
              Panel Administrativo
            </span>

            <h1>
              {tenant?.name || 'DiamondStats'}
            </h1>

            <p>
              Resumen general del equipo autenticado.
            </p>
          </div>

          <div className="admin-dashboard-actions">
            <Link to="/admin/players/create">
              Crear Jugador
            </Link>

            <Link to="/admin/games/create">
              Crear Juego
            </Link>
          </div>
        </div>

        <div className="admin-dashboard-stats">
          <div className="admin-stat-card">
            <span>Jugadores</span>
            <strong>{totals.total_players || 0}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Equipos</span>
            <strong>{totals.total_teams || 0}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Juegos</span>
            <strong>{totals.total_games || 0}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Completados</span>
            <strong>{totals.completed_games || 0}</strong>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h2>Últimos Juegos</h2>
              <Link to="/admin/games">Ver todos</Link>
            </div>

            {recentGames.length === 0 ? (
              <p className="admin-empty-text">
                No hay juegos registrados.
              </p>
            ) : (
              <div className="admin-game-list">
                {recentGames.map((game) => (
                  <div key={game.id} className="admin-game-item">
                    <div>
                      <strong>
                        {game.home_team || 'Local'} vs {game.away_team || 'Visitante'}
                      </strong>

                      <span>
                        {game.game_date
                          ? new Date(game.game_date).toLocaleDateString()
                          : 'Sin fecha'}
                      </span>
                    </div>

                    <strong className="admin-score">
                      {game.home_score ?? 0} - {game.away_score ?? 0}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h2>Top Bateo</h2>
              <Link to="/admin/stats/batting">Ver bateo</Link>
            </div>

            {topBatters.length === 0 ? (
              <p className="admin-empty-text">
                No hay estadísticas ofensivas.
              </p>
            ) : (
              <div className="admin-player-list">
                {topBatters.map((player, index) => (
                  <div key={player.id} className="admin-player-item">
                    <span>{index + 1}</span>

                    <img
                      src={player.photo_url || 'https://placehold.co/60x60'}
                      alt={player.full_name}
                    />

                    <div>
                      <strong>{player.full_name}</strong>
                      <small>AVG {player.avg || '.000'} • H {player.h || 0}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h2>Top Pitcheo</h2>
              <Link to="/admin/stats/pitching">Ver pitcheo</Link>
            </div>

            {topPitchers.length === 0 ? (
              <p className="admin-empty-text">
                No hay estadísticas de pitcheo.
              </p>
            ) : (
              <div className="admin-player-list">
                {topPitchers.map((player, index) => (
                  <div key={player.id} className="admin-player-item">
                    <span>{index + 1}</span>

                    <img
                      src={player.photo_url || 'https://placehold.co/60x60'}
                      alt={player.full_name}
                    />

                    <div>
                      <strong>{player.full_name}</strong>
                      <small>ERA {player.era || '0.00'} • SO {player.strikeouts || 0}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel-card admin-shortcuts-card">
            <h2>Accesos Rápidos</h2>

            <div className="admin-shortcuts">
              <Link to="/admin/players">Administrar jugadores</Link>
              <Link to="/admin/players/create">Crear jugador</Link>
              <Link to="/admin/teams/create">Crear equipo</Link>
              <Link to="/admin/games/create">Crear juego</Link>
              <Link to="/admin/games">Registrar estadísticas</Link>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminDashboardPage