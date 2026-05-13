import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'
import DashboardLayout from '../../layouts/DashboardLayout'

import { getGames } from '../../api/games.api'

import './GamesPage.css'

function GamesPage({ admin = false }) {

  const Layout = admin
    ? DashboardLayout
    : PublicLayout

  const [games, setGames] = useState([])

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {

    try {

      const res = await getGames()

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.games || []

      setGames(data)

    } catch (error) {

      console.log(error)
    }
  }

  return (
    <Layout>

      <section className="games-page">

        <div className="games-header">

          <h1 className="games-title">
            {admin
              ? 'Partidos / Cargar Stats'
              : 'Juegos'}
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