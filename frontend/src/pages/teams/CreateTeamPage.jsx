// src/pages/teams/CreateTeamPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
} from '../../api/teams.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './CreateTeamPage.css'

function CreateTeamPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const isEditMode = Boolean(id)

  const initialForm = {
    name: '',
    short_name: '',
    city: '',
    manager_name: '',
    logo_url: '',
  }

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      loadTeam()
    }
  }, [id])

  const loadTeam = async () => {
    try {
      const res = await getTeamById(id)

      const team = res.data.team || res.data

      setForm({
        name: team.name || '',
        short_name: team.short_name || '',
        city: team.city || '',
        manager_name: team.manager_name || '',
        logo_url: team.logo_url || '',
      })
    } catch (error) {
      console.log(error)
      alert('Error cargando equipo rival')
    }
  }

  const resetForm = () => {
    setForm(initialForm)
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    short_name: form.short_name.trim() || null,
    city: form.city.trim() || null,
    manager_name: form.manager_name.trim() || null,
    logo_url: form.logo_url.trim() || null,
    is_main: false,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('El nombre del equipo rival es obligatorio')
      return
    }

    try {
      setLoading(true)

      const payload = buildPayload()

      if (isEditMode) {
        await updateTeam(id, payload)
        alert('Equipo rival actualizado correctamente')
        return
      }

      await createTeam(payload)

      alert('Equipo rival registrado correctamente')
      resetForm()
    } catch (error) {
      console.log(error)

      const message =
        error.response?.data?.message ||
        (isEditMode
          ? 'Error actualizando equipo rival'
          : 'Error registrando equipo rival')

      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm(
      '¿Seguro que deseas eliminar este equipo rival? Esta acción no se puede deshacer.'
    )

    if (!confirmed) return

    try {
      setLoading(true)

      await deleteTeam(id)

      alert('Equipo rival eliminado correctamente')

      navigate('/admin/teams')
    } catch (error) {
      console.log(error)

      const message =
        error.response?.data?.message ||
        'Error eliminando equipo rival'

      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="create-team-page">
        <PageHeader
          title={isEditMode ? 'Editar Equipo Rival' : 'Registrar Equipo Rival'}
          subtitle={
            isEditMode
              ? 'Modifica o elimina el equipo rival seleccionado'
              : 'Agrega los equipos contrarios que enfrentarás en tus juegos'
          }
        />

        <div className="create-team-container">
          <form
            onSubmit={handleSubmit}
            className="create-team-form"
          >
            <div className="team-form-grid">
              <div className="team-form-group">
                <Input
                  label="Nombre del Equipo Rival"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="team-form-group">
                <Input
                  label="Nombre Corto"
                  name="short_name"
                  value={form.short_name}
                  onChange={handleChange}
                  placeholder="Ej: AGU"
                />
              </div>

              <div className="team-form-group">
                <Input
                  label="Ciudad"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Ej: Santo Domingo"
                />
              </div>

              <div className="team-form-group">
                <Input
                  label="Manager / Contacto"
                  name="manager_name"
                  value={form.manager_name}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="team-form-group full-width">
              <Input
                label="Logo URL"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>

            <div className="team-button-container">
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Guardando...'
                  : isEditMode
                    ? 'Actualizar Equipo Rival'
                    : 'Guardar Equipo Rival'}
              </Button>

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-team-form-btn"
                  disabled={loading}
                >
                  Eliminar Equipo Rival
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CreateTeamPage