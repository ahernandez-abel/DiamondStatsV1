// src/pages/games/CreateGamePage.jsx

import { useEffect, useState } from 'react'

import { createGame } from '../../api/games.api'
import { getTeams } from '../../api/teams.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './CreateGamePage.css'

function CreateGamePage() {

  const initialForm = {
    home_team_id: '',
    away_team_id: '',
    game_date: '',
    game_time: '',
    venue: '',
    status: 'pending',
  }

  const [teams, setTeams] = useState([])
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const res = await getTeams()
      setTeams(res.data.teams || [])
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.home_team_id === form.away_team_id) {
      alert('El equipo Home y Away no pueden ser el mismo')
      return
    }

    try {
      await createGame(form)

      alert('Juego creado correctamente')

      setForm(initialForm)

    } catch (error) {
      console.log(error)
      alert('Error creando juego')
    }
  }

  return (
    <DashboardLayout>

      <div className="create-game-page">

        <PageHeader
          title="Crear Juego"
          subtitle="Registrar nuevo partido de softball"
        />

        <div className="create-game-container">

          <form
            onSubmit={handleSubmit}
            className="create-game-form"
          >

            <div className="game-teams-grid">

              <div className="game-form-group">

                <label className="game-label">
                  Equipo Home
                </label>

                <select
                  name="home_team_id"
                  value={form.home_team_id}
                  onChange={handleChange}
                  className="game-select"
                  required
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

              <div className="game-form-group">

                <label className="game-label">
                  Equipo Away
                </label>

                <select
                  name="away_team_id"
                  value={form.away_team_id}
                  onChange={handleChange}
                  className="game-select"
                  required
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

            </div>

            <div className="game-info-grid">

              <div className="game-form-group">

                <Input
                  label="Fecha del Juego"
                  type="date"
                  name="game_date"
                  value={form.game_date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="game-form-group">

                <Input
                  label="Hora del Juego"
                  type="time"
                  name="game_time"
                  value={form.game_time}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="game-form-group full-width">

              <Input
                label="Lugar / Estadio"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Ej: Estadio Quisqueya"
              />

            </div>

            <div className="game-form-group full-width">

              <label className="game-label">
                Estado del Juego
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="game-select"
              >

                <option value="pending">
                  Pendiente
                </option>

                <option value="live">
                  En Vivo
                </option>

                <option value="final">
                  Finalizado
                </option>

              </select>

            </div>

            <div className="game-button-container">

              <Button type="submit">
                Guardar Juego
              </Button>

            </div>

          </form>

        </div>

      </div>

    </DashboardLayout>
  )
}

export default CreateGamePage