import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import DashboardLayout from '../../layouts/DashboardLayout'
import PageHeader from '../../components/layout/PageHeader'

import {
  getPlayers,
  deletePlayer,
} from '../../api/players.api'

import './AdminPlayersPage.css'

function AdminPlayersPage() {
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    loadPlayers()
  }, [page, limit, position, status])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadPlayers(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  const loadPlayers = async (customPage = page) => {
    try {
      setLoading(true)

      const res = await getPlayers(null, {
        page: customPage,
        limit,
        search,
        position,
        status,
      })

      setPlayers(res.data.players || [])

      setPagination(
        res.data.pagination || {
          page: customPage,
          limit,
          total: res.data.players?.length || 0,
          totalPages: 1,
        }
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = confirm('¿Seguro que deseas eliminar este jugador?')

    if (!confirmDelete) return

    try {
      await deletePlayer(id)
      loadPlayers()
    } catch (error) {
      console.log(error)
      alert('Error eliminando jugador')
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setPosition('')
    setStatus('')
    setLimit(20)
    setPage(1)
  }

  const goToPreviousPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1)
    }
  }

  const goToNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1)
    }
  }

  return (
    <DashboardLayout>
      <div className="admin-players-page">
        <PageHeader
          title="Administrar Jugadores"
          subtitle="Editar, filtrar o eliminar jugadores registrados"
        />

        <div className="admin-players-card">
          <div className="admin-players-toolbar">
            <input
              type="text"
              placeholder="Buscar jugador, equipo o posición..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-player-search"
            />

            <select
              value={position}
              onChange={(e) => {
                setPosition(e.target.value)
                setPage(1)
              }}
              className="admin-player-filter"
            >
              <option value="">Todas las posiciones</option>
              

<option value="INF">INF - Infielder</option>

<option value="OF">OF - Outfielder</option>

<option value="P">P - Pitcher</option>

<option value="C">C - Catcher</option>

<option value="UTIL">UTIL - Utility</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="admin-player-filter"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="admin-player-filter"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>

            <button
              type="button"
              onClick={handleClearFilters}
              className="clear-player-filters-btn"
            >
              Limpiar
            </button>
          </div>

          <div className="admin-players-summary">
            <div className="summary-box">
              <span>Total Jugadores</span>
              <strong>{pagination.total}</strong>
            </div>

            <div className="summary-box">
              <span>Página</span>
              <strong>
                {pagination.page} / {pagination.totalPages}
              </strong>
            </div>
          </div>

          <div className="admin-players-table-wrapper">
            <table className="admin-players-table">
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Número</th>
                  <th>Posición</th>
                  <th>Equipo</th>
                  <th>Batea</th>
                  <th>Lanza</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {!loading && players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <div className="admin-player-profile">
                        <img
                          src={
                            player.photo_url ||
                            'https://placehold.co/80x80?text=DS'
                          }
                          alt={player.full_name}
                          className="admin-player-photo"
                        />

                        <div>
                          <h3>{player.full_name}</h3>
                          <p>{player.nickname || 'Sin apodo'}</p>
                        </div>
                      </div>
                    </td>

                    <td>#{player.jersey_number || '-'}</td>
                    <td>{player.position || '-'}</td>
                    <td>{player.team_name || '-'}</td>
                    <td>{player.batting_hand || '-'}</td>
                    <td>{player.throwing_hand || '-'}</td>

                    <td>
                      <span
                        className={
                          player.is_active
                            ? 'status-active'
                            : 'status-inactive'
                        }
                      >
                        {player.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="admin-player-buttons">
                        <Link
                          to={`/admin/players/${player.id}/edit`}
                          className="edit-player-btn"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(player.id)}
                          className="delete-player-btn"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="admin-empty">
                Cargando jugadores...
              </div>
            )}

            {!loading && players.length === 0 && (
              <div className="admin-empty">
                No se encontraron jugadores.
              </div>
            )}
          </div>

          <div className="admin-pagination">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={pagination.page <= 1}
            >
              Anterior
            </button>

            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminPlayersPage