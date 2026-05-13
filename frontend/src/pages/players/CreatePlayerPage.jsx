// src/pages/players/CreatePlayerPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  createPlayer,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} from '../../api/players.api'

import { getTeams } from '../../api/teams.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './CreatePlayerPage.css'

function CreatePlayerPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const isEditMode = Boolean(id)

  const [teams, setTeams] = useState([])

  const [form, setForm] = useState({
    full_name: '',
    nickname: '',
    jersey_number: '',
    position: '',
    batting_hand: '',
    throwing_hand: '',
    photo_url: '',
    team_id: '',
    is_active: true,
  })

  useEffect(() => {
    loadTeams()

    if (isEditMode) {
      loadPlayer()
    }
  }, [id])

  const loadTeams = async () => {
    try {
      const res = await getTeams()
      setTeams(res.data.teams || [])
    } catch (error) {
      console.log(error)
    }
  }

  const loadPlayer = async () => {
    try {
      const res = await getPlayerById(id)

      const player = res.data.player

      setForm({
        full_name: player.full_name || '',
        nickname: player.nickname || '',
        jersey_number: player.jersey_number || '',
        position: player.position || '',
        batting_hand: player.batting_hand || '',
        throwing_hand: player.throwing_hand || '',
        photo_url: player.photo_url || '',
        team_id: player.team_id || '',
        is_active: player.is_active ?? true,
      })
    } catch (error) {
      console.log(error)
      alert('Error cargando jugador')
    }
  }

  const resetForm = () => {
    setForm({
      full_name: '',
      nickname: '',
      jersey_number: '',
      position: '',
      batting_hand: '',
      throwing_hand: '',
      photo_url: '',
      team_id: '',
      is_active: true,
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === 'checkbox'
        ? checked
        : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isEditMode) {
        await updatePlayer(id, form)
        alert('Jugador actualizado correctamente')
        return
      }

      await createPlayer(form)

      alert('Jugador creado correctamente')

      resetForm()

    } catch (error) {
      console.log(error)

      alert(
        isEditMode
          ? 'Error actualizando jugador'
          : 'Error creando jugador'
      )
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm(
      '¿Seguro que deseas eliminar este jugador? Esta acción no se puede deshacer.'
    )

    if (!confirmed) return

    try {
      await deletePlayer(id)

      alert('Jugador eliminado correctamente')

      navigate('/admin/players')

    } catch (error) {
      console.log(error)
      alert('Error eliminando jugador')
    }
  }

  return (
    <DashboardLayout>

      <div className="create-player-page">

        <PageHeader
          title={isEditMode ? 'Editar Jugador' : 'Crear Jugador'}
          subtitle={
            isEditMode
              ? 'Modificar o eliminar jugador registrado'
              : 'Registrar nuevo jugador en el sistema'
          }
        />

        <div className="create-player-container">

          <form
            onSubmit={handleSubmit}
            className="create-player-form"
          >

            <div className="form-grid">

              <div className="form-group">

                <Input
                  label="Nombre Completo"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <Input
                  label="Apodo"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <Input
                  label="Número"
                  name="jersey_number"
                  value={form.jersey_number}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <Input
                  label="Posición"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <Input
                  label="Batea"
                  name="batting_hand"
                  value={form.batting_hand}
                  onChange={handleChange}
                  placeholder="R / L / S"
                />

              </div>

              <div className="form-group">

                <Input
                  label="Lanza"
                  name="throwing_hand"
                  value={form.throwing_hand}
                  onChange={handleChange}
                  placeholder="R / L"
                />

              </div>

            </div>

            <div className="form-group full-width">

              <Input
                label="Foto URL"
                name="photo_url"
                value={form.photo_url}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label className="select-label">
                Equipo
              </label>

              <select
                name="team_id"
                value={form.team_id}
                onChange={handleChange}
                className="custom-select"
              >

                <option value="">
                  Seleccionar equipo
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}

              </select>

            </div>

            {isEditMode && (
              <div className="form-group full-width">

                <label className="player-active-check">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />

                  Jugador activo

                </label>

              </div>
            )}

            <div className="form-button-container player-form-actions">

              <Button type="submit">
                {isEditMode ? 'Actualizar Jugador' : 'Guardar Jugador'}
              </Button>

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-player-form-btn"
                >
                  Eliminar Jugador
                </button>
              )}

            </div>

          </form>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default CreatePlayerPage