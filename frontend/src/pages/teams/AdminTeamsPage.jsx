import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import DashboardLayout from '../../layouts/DashboardLayout'
import PageHeader from '../../components/layout/PageHeader'

import {
  getTeams,
  deleteTeam,
} from '../../api/teams.api'

import './AdminTeamsPage.css'

function AdminTeamsPage() {
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const res = await getTeams()
      setTeams(res.data.teams || [])
    } catch (error) {
      console.log(error)
      setTeams([])
    }
  }

  const filteredTeams = teams.filter((team) => {
    const text = `
      ${team.name || ''}
      ${team.short_name || ''}
      ${team.city || ''}
      ${team.manager_name || ''}
    `.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  const rivalTeams = filteredTeams.filter(
    (team) => team.is_main !== true && team.is_main !== 'true'
  )

  const handleDelete = async (team) => {
    const confirmed = confirm(
      `¿Seguro que deseas eliminar el equipo rival "${team.name}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    try {
      await deleteTeam(team.id)
      await loadTeams()
    } catch (error) {
      console.log(error)

      const message =
        error.response?.data?.message ||
        'Error eliminando equipo rival'

      alert(message)
    }
  }

  return (
    <DashboardLayout>
      <div className="admin-teams-page">
        <PageHeader
          title="Administrar Equipos Rivales"
          subtitle="Editar o eliminar equipos rivales registrados"
        />

        <div className="admin-teams-card">
          <div className="admin-teams-toolbar">
            <input
              type="text"
              placeholder="Buscar equipo, ciudad o manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-team-search"
            />

            <Link
              to="/admin/teams/create"
              className="admin-team-create-btn"
            >
              Crear Equipo Rival
            </Link>
          </div>

          <div className="admin-teams-summary">
            <div className="summary-box">
              <span>Total Rivales</span>
              <strong>
                {
                  teams.filter(
                    (team) =>
                      team.is_main !== true &&
                      team.is_main !== 'true'
                  ).length
                }
              </strong>
            </div>

            <div className="summary-box">
              <span>Mostrando</span>
              <strong>{rivalTeams.length}</strong>
            </div>
          </div>

          <div className="admin-teams-table-wrapper">
            <table className="admin-teams-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Nombre Corto</th>
                  <th>Ciudad</th>
                  <th>Manager</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rivalTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="admin-team-profile">
                        <img
                          src={
                            team.logo_url ||
                            'https://placehold.co/80x80?text=DS'
                          }
                          alt={team.name}
                          className="admin-team-logo"
                        />

                        <div>
                          <h3>{team.name}</h3>
                          <p>{team.slug || 'Sin slug'}</p>
                        </div>
                      </div>
                    </td>

                    <td>{team.short_name || '-'}</td>

                    <td>{team.city || '-'}</td>

                    <td>{team.manager_name || '-'}</td>

                    <td>
                      <span className="team-type-rival">
                        Rival
                      </span>
                    </td>

                    <td>
                      <div className="admin-team-buttons">
                        <Link
                          to={`/admin/teams/${team.id}/edit`}
                          className="edit-team-btn"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(team)}
                          className="delete-team-btn"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rivalTeams.length === 0 && (
              <div className="admin-teams-empty">
                No se encontraron equipos rivales.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminTeamsPage