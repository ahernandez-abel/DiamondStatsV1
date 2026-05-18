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

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      const res = await getPlayers()
      setPlayers(res.data.players || [])
    } catch (error) {
      console.log(error)
    }
  }

  const filteredPlayers = players.filter((player) => {
    const text = `${player.full_name} ${player.nickname} ${player.position} ${player.team_name}`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

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

  return (
    <DashboardLayout>

      <div className="admin-players-page">

        <PageHeader
          title="Administrar Jugadores"
          subtitle="Editar o eliminar jugadores registrados"
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

          

          </div>

          <div className="admin-players-summary">

            <div className="summary-box">
              <span>Total Jugadores</span>
              <strong>{players.length}</strong>
            </div>

            <div className="summary-box">
              <span>Mostrando</span>
              <strong>{filteredPlayers.length}</strong>
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

                {filteredPlayers.map((player) => (

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

                          <h3>
                            {player.full_name}
                          </h3>

                          <p>
                            {player.nickname || 'Sin apodo'}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td>
                      #{player.jersey_number || '-'}
                    </td>

                    <td>
                      {player.position || '-'}
                    </td>

                    <td>
                      {player.team_name || '-'}
                    </td>

                    <td>
                      {player.batting_hand || '-'}
                    </td>

                    <td>
                      {player.throwing_hand || '-'}
                    </td>

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

            {filteredPlayers.length === 0 && (
              <div className="admin-empty">
                No se encontraron jugadores.
              </div>
            )}

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default AdminPlayersPage