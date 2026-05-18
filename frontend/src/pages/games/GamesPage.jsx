import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'
import DashboardLayout from '../../layouts/DashboardLayout'

import {
  getGames,
  deleteGame,
} from '../../api/games.api'

import { getPublicHome } from '../../api/public.api'

import './GamesPage.css'

function GamesPage({ admin = false }) {
  const { tenantSlug } = useParams()

  const Layout = admin ? DashboardLayout : PublicLayout

  const [games, setGames] = useState([])
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    loadGames()
  }, [tenantSlug])

  const loadGames = async () => {
    try {
      if (tenantSlug && !admin) {
        const res = await getPublicHome(tenantSlug)

        setTenant(res.data.tenant || null)
        setGames(res.data.games || [])

        return
      }

      const res = await getGames()

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.games || []

      setGames(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      '¿Seguro que deseas eliminar este juego? Esta acción no se puede deshacer.'
    )

    if (!confirmDelete) return

    try {
      await deleteGame(id)
      await loadGames()
    } catch (error) {
      console.log(error)
      alert('Error eliminando juego')
    }
  }

  return (
    <Layout tenantSlug={tenantSlug}>
      <section className="games-page">
        <div className="games-header">
          <span className="players-badge">
            {tenant?.name || 'DiamondStats Games'}
          </span>

          <h1 className="games-title">
            {admin ? 'Partidos / Cargar Stats' : 'Juegos'}
          </h1>

          <p className="games-subtitle">
            {admin
              ? 'Selecciona el partido y luego carga las estadísticas de los jugadores que participaron'
              : 'Calendario y resultados oficiales del equipo'}
          </p>
        </div>

        <div className="games-list">
          {games.length === 0 ? (
            <div className="game-empty">
              No hay partidos registrados.
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                className="game-card"
              >
                <div className="game-card-content">
                  <div className="game-info">
                    <h2 className="game-match">
                      {game.home_team_name || 'Home'}

                      <span className="vs-text">
                        VS
                      </span>

                      {game.away_team_name || 'Away'}
                    </h2>

                    <div className="game-details">
                      <p>
                        <strong>Fecha:</strong> {game.game_date}
                      </p>

                      <p>
                        <strong>Lugar:</strong> {game.venue || 'Sin estadio'}
                      </p>

                      <p className="game-status">
                        Estado: {game.status}
                      </p>
                    </div>
                  </div>

                  <div className="game-score">
                    <span>
                      {game.home_score ?? '-'}
                    </span>

                    <small>
                      -
                    </small>

                    <span>
                      {game.away_score ?? '-'}
                    </span>
                  </div>

                  {admin && (
                    <div className="game-action">
                      <Link
                        to={`/admin/games/${game.id}/stats`}
                        className="stats-button"
                      >
                        Cargar Stats Jugadores
                      </Link>

                      <Link
                        to={`/admin/games/${game.id}/result`}
                        className="result-button"
                      >
                        Resultado del Juego
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(game.id)}
                        className="delete-game-button"
                      >
                        Eliminar Juego
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  )
}

export default GamesPage