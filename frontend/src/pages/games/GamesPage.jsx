import { useEffect, useMemo, useState } from 'react'
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

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

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

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const text = `
        ${game.home_team_name || ''}
        ${game.away_team_name || ''}
        ${game.venue || ''}
        ${game.status || ''}
      `.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesStatus =
        !status || game.status === status

      const matchesDate =
        !dateFilter || game.game_date === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [games, search, status, dateFilter])

  const totalPages = Math.max(
    Math.ceil(filteredGames.length / limit),
    1
  )

  const paginatedGames = filteredGames.slice(
    (page - 1) * limit,
    page * limit
  )

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

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setDateFilter('')
    setLimit(20)
    setPage(1)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handleDateChange = (e) => {
    setDateFilter(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  return (
    <Layout tenantSlug={tenantSlug}>
      <section className="games-page">
        <div className="games-header">
          <div>
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

          <div className="games-counter">
            <span>Total Juegos</span>
            <strong>{filteredGames.length}</strong>
          </div>
        </div>

        <div className="games-filters">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar equipo, rival o estadio ..."
            className="games-search"
          />

          <select
            value={status}
            onChange={handleStatusChange}
            className="games-filter"
          >
            <option value="">Todos</option>
<option value="final">Finalizados</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={handleDateChange}
            className="games-filter"
          />

          <select
            value={limit}
            onChange={handleLimitChange}
            className="games-filter"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="games-clear-btn"
          >
            Limpiar
          </button>
        </div>

        <div className="games-list">
          {paginatedGames.length === 0 ? (
            <div className="game-empty">
              No hay partidos registrados.
            </div>
          ) : (
            paginatedGames.map((game) => (
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
                        Cargar Stats
                      </Link>

                      <Link
                        to={`/admin/games/${game.id}/result`}
                        className="result-button"
                      >
                        Resultado
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(game.id)}
                        className="delete-game-button"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="games-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>

          <span>
            Página {page} de {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </section>
    </Layout>
  )
}

export default GamesPage