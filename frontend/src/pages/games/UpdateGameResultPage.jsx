// src/pages/games/UpdateGameResultPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getGameById,
  updateGameResult,
} from '../../api/games.api'

import DashboardLayout from '../../layouts/DashboardLayout'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

import './UpdateGameResultPage.css'

function UpdateGameResultPage() {

  const { id } = useParams()

  const navigate = useNavigate()

  const [game, setGame] = useState(null)

  const [form, setForm] = useState({
    home_score: '',
    away_score: '',
    status: 'finished',
    notes: '',
  })

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {

    try {

      const res = await getGameById(id)

      setGame(res.data)

      setForm({
        home_score: res.data.home_score ?? '',
        away_score: res.data.away_score ?? '',
        status: res.data.status || 'finished',
        notes: res.data.notes || '',
      })

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

    try {

      await updateGameResult(id, form)

      navigate('/admin/games')

    } catch (error) {

      console.log(error)

      alert('Error publicando resultado')
    }
  }

  return (
    <DashboardLayout>

      <div className="update-game-page">

        <PageHeader
          title="Publicar Resultado"
          subtitle="Registrar marcador final del partido"
        />

        {game && (

          <div className="game-summary-card">

            <div className="summary-top">

              <span className="summary-badge">
                Resultado Oficial
              </span>

            </div>

            <h2 className="summary-match">

              {game.home_team_name || 'Home'}

              <span className="summary-vs">
                VS
              </span>

              {game.away_team_name || 'Away'}

            </h2>

            <div className="summary-details">

              <p>
                <strong>Fecha:</strong> {game.game_date}
              </p>

              <p>
                <strong>Lugar:</strong> {game.venue || '-'}
              </p>

            </div>

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="update-game-form"
        >

          <div className="score-grid">

            <div className="score-box">

              <label className="score-label">
                Carreras Equipo Home
              </label>

              <Input
                type="number"
                name="home_score"
                value={form.home_score}
                onChange={handleChange}
                required
              />

            </div>

            <div className="score-box">

              <label className="score-label">
                Carreras Equipo Away
              </label>

              <Input
                type="number"
                name="away_score"
                value={form.away_score}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          <div className="form-group">

            <label className="form-label">
              Estado del Juego
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="custom-select"
            >

              

              <option value="final">
  Finalizado
</option>

            </select>

          </div>

          <div className="form-group">

            <label className="form-label">
              Notas del Juego
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="custom-textarea"
              placeholder="Notas internas del partido..."
            />

          </div>

          <div className="submit-container">

            <Button type="submit">
              Publicar Resultado
            </Button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  )
}

export default UpdateGameResultPage