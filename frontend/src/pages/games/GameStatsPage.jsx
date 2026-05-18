// src/pages/games/GameStatsPage.jsx

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

const battingFields = [
  { key: 'ab', label: 'Turnos oficiales (AB)' },
  { key: 'h', label: 'Hits (H)' },
  { key: 'doubles', label: 'Dobles (2B)' },
  { key: 'triples', label: 'Triples (3B)' },
  { key: 'hr', label: 'Jonrones (HR)' },
  { key: 'rbi', label: 'Carreras impulsadas (RBI)' },
  { key: 'r', label: 'Carreras anotadas (R)' },
  { key: 'sb', label: 'Bases robadas (SB)' },
  { key: 'cs', label: 'Atrapado robando (CS)' },
  { key: 'so', label: 'Ponches recibidos (SO)' },
  { key: 'bb', label: 'Bases por bolas (BB)' },
  { key: 'sf', label: 'Elevado de sacrificio (SF)' },
  
]

const pitchingFields = [
  { key: 'ip', label: 'Entradas lanzadas (IP)', step: '0.1' },
  { key: 'hits_allowed', label: 'Hits permitidos (H)' },
  { key: 'er', label: 'Carreras limpias (ER)' },
  { key: 'r_allowed', label: 'Carreras permitidas (R)' },
  { key: 'bb', label: 'Bases por bolas (BB)' },
  { key: 'so', label: 'Ponches (SO)' },
  { key: 'hr_allowed', label: 'Jonrones permitidos (HR)' },
  
]

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
    ip: 0,
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

const convertIpToOuts = (ipValue) => {
  const value = String(ipValue || 0).trim()

  if (!value) return 0

  const [inningsValue, outsValue = '0'] = value.split('.')

  const innings = Number(inningsValue) || 0
  const outs = Number(outsValue) || 0

  if (outs > 2) {
    return (innings * 3)
  }

  return (innings * 3) + outs
}

const convertOutsToIp = (outsValue) => {
  const totalOuts = Number(outsValue) || 0

  const innings = Math.floor(totalOuts / 3)
  const outs = totalOuts % 3

  return Number(`${innings}.${outs}`)
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
      const pitchingStats = stats.pitching || null

      setForm({
        batting: {
          ...initialForm.batting,
          ...(stats.batting || {}),
        },
        pitching: {
          ...initialForm.pitching,
          ...(pitchingStats || {}),
          pitched: Boolean(pitchingStats),
          ip: convertOutsToIp(pitchingStats?.outs_recorded || 0),
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

    const pitchingPayload = {
      ...form.pitching,
      outs_recorded: convertIpToOuts(form.pitching.ip),
    }

    delete pitchingPayload.ip

    try {
      await savePlayerGameStats(id, {
        player_id: selectedPlayer,
        team_id: teamId,
        batting: form.batting,
        pitching: pitchingPayload,
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
              {battingFields.map((field) => (
                <div
                  key={field.key}
                  className="form-group"
                >
                  <label className="custom-label">
                    {field.label}
                  </label>

                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    name={field.key}
                    value={form.batting[field.key]}
                    onChange={handleBattingChange}
                    className="custom-input"
                  />
                </div>
              ))}
            </div>

            <div className="stats-glossary">
              <h4>Glosario de bateo</h4>

              <div className="stats-glossary-grid">
                <p><strong>AB:</strong> Turnos oficiales al bate.</p>
                <p><strong>H:</strong> Hits conectados.</p>
                <p><strong>2B:</strong> Dobles.</p>
                <p><strong>3B:</strong> Triples.</p>
                <p><strong>HR:</strong> Jonrones.</p>
                <p><strong>RBI:</strong> Carreras impulsadas.</p>
                <p><strong>R:</strong> Carreras anotadas.</p>
                <p><strong>SB:</strong> Bases robadas.</p>
                <p><strong>CS:</strong> Atrapado robando.</p>
                <p><strong>SO:</strong> Ponches recibidos.</p>
                <p><strong>BB:</strong> Bases por bolas recibidas.</p>
                <p><strong>SF:</strong> Elevado de sacrificio.</p>
                
              </div>
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
                Pitcheo
              </h3>
            </div>

            {form.pitching.pitched && (
              <>
                <div className="pitching-note">
                  Para entradas lanzadas usa este formato: 1.0 = una entrada completa,
                  1.1 = una entrada y un out, 1.2 = una entrada y dos outs.
                </div>

                <div className="stats-grid">
                  {pitchingFields.map((field) => (
                    <div
                      key={field.key}
                      className="form-group"
                    >
                      <label className="custom-label">
                        {field.label}
                      </label>

                      <input
                        type="number"
                        min="0"
                        step={field.step || '1'}
                        inputMode="decimal"
                        name={field.key}
                        value={form.pitching[field.key]}
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

                <div className="stats-glossary">
                  <h4>Glosario de pitcheo</h4>

                  <div className="stats-glossary-grid">
                    <p><strong>IP:</strong> Entradas lanzadas.</p>
                    <p><strong>H:</strong> Hits permitidos.</p>
                    <p><strong>ER:</strong> Carreras limpias permitidas.</p>
                    <p><strong>R:</strong> Carreras totales permitidas.</p>
                    <p><strong>BB:</strong> Bases por bolas otorgadas.</p>
                    <p><strong>SO:</strong> Ponches realizados.</p>
                    <p><strong>HR:</strong> Jonrones permitidos.</p>
                    <p><strong>W:</strong> Juego ganado.</p>
                    <p><strong>L:</strong> Juego perdido.</p>
                    <p><strong>S:</strong> Juego salvado.</p>
                    <p><strong>ERA:</strong> Carreras limpias por cada 7 entradas.</p>
                    <p><strong>WHIP:</strong> Bases por bolas más hits por entrada lanzada.</p>
                  </div>
                </div>
              </>
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