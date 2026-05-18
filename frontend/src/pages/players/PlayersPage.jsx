// src/pages/players/PlayersPage.jsx

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'

import { getPlayers } from '../../api/players.api'
import { getPublicHome } from '../../api/public.api'

import PlayerCard from '../../components/cards/PlayerCard'

import './PlayersPage.css'

function PlayersPage() {
  const { tenantSlug } = useParams()

  const [players, setPlayers] = useState([])
  const [tenant, setTenant] = useState(null)

  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    loadPlayers()
  }, [tenantSlug])

  const loadPlayers = async () => {
    try {
      if (tenantSlug) {
        const res = await getPublicHome(tenantSlug)

        setTenant(res.data.tenant || null)
        setPlayers(res.data.players || [])

        return
      }

      const res = await getPlayers()

      setPlayers(res.data.players || [])
    } catch (error) {
      console.log(error)
    }
  }

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const text = `
        ${player.full_name || ''}
        ${player.nickname || ''}
        ${player.position || ''}
        ${player.team_name || ''}
      `.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesPosition =
        !position || player.position === position

      return matchesSearch && matchesPosition
    })
  }, [players, search, position])

  const totalPages = Math.max(
    Math.ceil(filteredPlayers.length / limit),
    1
  )

  const paginatedPlayers = filteredPlayers.slice(
    (page - 1) * limit,
    page * limit
  )

  const basePath = tenantSlug ? `/team/${tenantSlug}` : ''

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handlePositionChange = (e) => {
    setPosition(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <section className="players-page">
        <div className="players-overlay"></div>

        <div className="players-content">
          <div className="players-header">
            <div>
              <span className="players-badge">
                {tenant?.name || 'DiamondStats Players'}
              </span>

              <h1 className="players-title">
                Jugadores
              </h1>

              <p className="players-subtitle">
                Estadísticas, perfiles y rendimiento completo de los jugadores de softball.
              </p>
            </div>

            <div className="players-stats-box">
              <h3>Total Jugadores</h3>
              <span>{filteredPlayers.length}</span>
            </div>
          </div>

          <div className="players-filters">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar jugador, apodo, equipo o posición..."
              className="players-search"
            />

            <select
              value={position}
              onChange={handlePositionChange}
              className="players-filter"
            >
              <option value="">Todas las posiciones</option>
              <option value="INF">INF - Infielder</option>
              <option value="OF">OF - Outfielder</option>
              <option value="P">P - Pitcher</option>
              <option value="C">C - Catcher</option>
              <option value="UTIL">UTIL - Utility</option>
            </select>

            <select
              value={limit}
              onChange={handleLimitChange}
              className="players-filter"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="players-grid">
            {paginatedPlayers.map((player) => (
              <Link
                key={player.id}
                to={`${basePath}/players/${player.id}`}
                className="player-link"
              >
                <PlayerCard player={player} />
              </Link>
            ))}
          </div>

          {paginatedPlayers.length === 0 && (
            <div className="players-empty">
              No se encontraron jugadores.
            </div>
          )}

          <div className="players-pagination">
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
        </div>
      </section>
    </PublicLayout>
  )
}

export default PlayersPage