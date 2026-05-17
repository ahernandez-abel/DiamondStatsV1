// src/pages/teams/CreateTeamPage.jsx

import { useState } from 'react'

import { createTeam } from '../../api/teams.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './CreateTeamPage.css'

function CreateTeamPage() {
  const initialForm = {
    name: '',
    short_name: '',
    city: '',
    manager_name: '',
    logo_url: '',
  }

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('El nombre del equipo rival es obligatorio')
      return
    }

    try {
      setLoading(true)

      await createTeam({
        ...form,
        name: form.name.trim(),
        short_name: form.short_name.trim() || null,
        city: form.city.trim() || null,
        manager_name: form.manager_name.trim() || null,
        logo_url: form.logo_url.trim() || null,
        is_main: false,
      })

      alert('Equipo rival registrado correctamente')

      setForm(initialForm)
    } catch (error) {
      console.log(error)

      const message =
        error.response?.data?.message ||
        'Error registrando equipo rival'

      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="create-team-page">
        <PageHeader
          title="Registrar Equipo Rival"
          subtitle="Agrega los equipos contrarios que enfrentarás en tus juegos"
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
                {loading ? 'Registrando...' : 'Guardar Equipo Rival'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CreateTeamPage