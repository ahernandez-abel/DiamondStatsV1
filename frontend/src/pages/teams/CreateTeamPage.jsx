// src/pages/teams/CreateTeamPage.jsx

import { useState } from 'react'


import { createTeam } from '../../api/teams.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './CreateTeamPage.css'

function CreateTeamPage() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    short_name: '',
    city: '',
    manager_name: '',
    logo_url: '',
    primary_color: '#16a34a',
    secondary_color: '#ffffff',
  })

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      await createTeam(form)

alert('Equipo creado correctamente')

setForm({
  name: '',
  short_name: '',
  city: '',
  manager_name: '',
  logo_url: '',
  primary_color: '#06b6d4',
  secondary_color: '#ffffff',
})

    } catch (error) {

      console.log(error)
      alert('Error creando equipo')
    }
  }

  return (
    <DashboardLayout>

      <div className="create-team-page">

        <PageHeader
          title="Crear Equipo"
          subtitle="Registrar nuevo equipo de softball"
        />

        <div className="create-team-container">

          <form
            onSubmit={handleSubmit}
            className="create-team-form"
          >

            <div className="team-form-grid">

              <div className="team-form-group">

                <Input
                  label="Nombre del Equipo"
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
                />

              </div>

              <div className="team-form-group">

                <Input
                  label="Ciudad"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />

              </div>

              <div className="team-form-group">

                <Input
                  label="Manager"
                  name="manager_name"
                  value={form.manager_name}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="team-form-group full-width">

              <Input
                label="Logo URL"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
              />

            </div>

            <div className="team-colors-section">

              <div className="color-card">

                <label className="color-label">
                  Color Primario
                </label>

                <div className="color-input-wrapper">

                  <input
                    type="color"
                    name="primary_color"
                    value={form.primary_color}
                    onChange={handleChange}
                    className="color-input"
                  />

                  <span className="color-code">
                    {form.primary_color}
                  </span>

                </div>

              </div>

              <div className="color-card">

                <label className="color-label">
                  Color Secundario
                </label>

                <div className="color-input-wrapper">

                  <input
                    type="color"
                    name="secondary_color"
                    value={form.secondary_color}
                    onChange={handleChange}
                    className="color-input"
                  />

                  <span className="color-code">
                    {form.secondary_color}
                  </span>

                </div>

              </div>

            </div>

            <div className="team-button-container">

              <Button type="submit">
                Guardar Equipo
              </Button>

            </div>

          </form>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default CreateTeamPage