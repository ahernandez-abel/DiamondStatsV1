import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getGameById } from '../../api/games.api'
import { getPlayers } from '../../api/players.api'

import {
  savePlayerGameStats,
  getPlayerGameStats,
} from '../../api/stats.api'

import DashboardLayout from '../../layouts/DashboardLayout'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'

import './GameStatsPage.css'

const initialForm = {
  batting: {
    ab: 0,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    rbi: 0,
    r: 0,
    sb: 0,
    cs: 0,
    so: 0,
    bb: 0,
    hbp: 0,
    sf: 0,
    sac: 0,
  },
  pitching: {
    pitched: false,
    outs_recorded: 0,
    hits_allowed: 0,
    er: 0,
    r_allowed: 0,
    bb: 0,
    so: 0,
    hr_allowed: 0,
    hbp: 0,
    result: '',
  },
}

function GameStatsPage() {
  const { id } = useParams()

  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [teamId, setTeamId] = useState('')
  const [form, setForm] = useState(initialForm)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerStats(selectedPlayer)
    }
  }, [selectedPlayer])

  const cleanNumber = (value) => {
    if (value === '') return ''

    const number = Number(value)

    if (Number.isNaN(number)) return 0

    return number < 0 ? 0 : number
  }

  const loadData = async () => {
    try {
      const gameRes = await getGameById(id)
      const playersRes = await getPlayers()

      const playersData = playersRes.data.players || []

      setGame(gameRes.data)
      setPlayers(playersData)

      if (playersData.length > 0) {
        setSelectedPlayer(playersData[0].id)
        setTeamId(playersData[0].team_id)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const loadPlayerStats = async (playerId) => {
    try {
      const player = players.find(
        (p) => String(p.id) === String(playerId)
      )

      setTeamId(player?.team_id || '')

      const res = await getPlayerGameStats(id, playerId)

      if (!res.data?.stats) {
        setForm(initialForm)
        setEditMode(false)
        return
      }

      const stats = res.data.stats

      setForm({
        batting: {
          ...initialForm.batting,
          ...(stats.batting || {}),
        },
        pitching: {
          ...initialForm.pitching,
          ...(stats.pitching || {}),
          pitched: Boolean(stats.pitching),
        },
      })

      setEditMode(true)
    } catch (error) {
      setForm(initialForm)
      setEditMode(false)
    }
  }

  const handleBattingChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      batting: {
        ...form.batting,
        [name]: cleanNumber(value),
      },
    })
  }

  const handlePitchingChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      pitching: {
        ...form.pitching,
        [name]: type === 'checkbox'
          ? checked
          : name === 'result'
            ? value
            : cleanNumber(value),
      },
    })
  }

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await savePlayerGameStats(id, {
        player_id: selectedPlayer,
        team_id: teamId,
        batting: form.batting,
        pitching: form.pitching,
      })

      alert(
        editMode
          ? 'Estadísticas actualizadas correctamente'
          : 'Estadísticas guardadas correctamente'
      )

      setForm(initialForm)
      setEditMode(false)
    } catch (error) {
      console.log(error)
      alert('Error guardando estadísticas')
    }
  }

  return (
    <DashboardLayout>
      <div className="game-stats-page">
        <PageHeader
          title="Registrar Estadísticas"
          subtitle="Selecciona un jugador, carga o modifica sus estadísticas del partido"
        />

        {game && (
          <div className="game-info-card">
            <h2 className="game-title">
              {game.home_team_name || 'Home'} vs {game.away_team_name || 'Away'}
            </h2>

            <p className="game-subtitle">
              Fecha: {game.game_date} | Lugar: {game.venue || '-'}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="game-stats-form"
        >
          <div className="form-group">
            <label className="custom-label">
              Jugador
            </label>

            <select
              value={selectedPlayer}
              onChange={handlePlayerChange}
              className="custom-select"
              required
            >
              {players.map((player) => (
                <option
                  key={player.id}
                  value={player.id}
                >
                  #{player.jersey_number || '00'} - {player.full_name}
                </option>
              ))}
            </select>
          </div>

          {editMode && (
            <div className="edit-alert">
              Este jugador ya tiene estadísticas registradas en este juego. Puedes modificarlas y actualizar.
            </div>
          )}

          <section className="stats-section">
            <h3 className="section-title batting">
              Bateo
            </h3>

            <div className="stats-grid">
              {Object.keys(form.batting).map((key) => (
                <div
                  key={key}
                  className="form-group"
                >
                  <label className="custom-label uppercase">
                    {key}
                  </label>

                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    name={key}
                    value={form.batting[key]}
                    onChange={handleBattingChange}
                    className="custom-input"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="stats-section">
            <div className="pitching-header">
              <input
                type="checkbox"
                name="pitched"
                checked={form.pitching.pitched}
                onChange={handlePitchingChange}
                className="pitching-checkbox"
              />

              <h3 className="section-title pitching">
                Pitcher
              </h3>
            </div>

            {form.pitching.pitched && (
              <div className="stats-grid">
                {[
                  'outs_recorded',
                  'hits_allowed',
                  'er',
                  'r_allowed',
                  'bb',
                  'so',
                  'hr_allowed',
                  'hbp',
                ].map((key) => (
                  <div
                    key={key}
                    className="form-group"
                  >
                    <label className="custom-label uppercase">
                      {key}
                    </label>

                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      name={key}
                      value={form.pitching[key]}
                      onChange={handlePitchingChange}
                      className="custom-input"
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label className="custom-label">
                    Resultado
                  </label>

                  <select
                    name="result"
                    value={form.pitching.result}
                    onChange={handlePitchingChange}
                    className="custom-select"
                  >
                    <option value="">
                      N/A
                    </option>

                    <option value="W">
                      Ganó
                    </option>

                    <option value="L">
                      Perdió
                    </option>

                    <option value="S">
                      Salvó
                    </option>
                  </select>
                </div>
              </div>
            )}
          </section>

          <div className="submit-container">
            <Button type="submit">
              {editMode
                ? 'Actualizar estadísticas del jugador'
                : 'Guardar estadísticas del jugador'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default GameStatsPage