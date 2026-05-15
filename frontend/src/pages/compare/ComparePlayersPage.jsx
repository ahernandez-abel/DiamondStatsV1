import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'
import DashboardLayout from '../../layouts/DashboardLayout'

import {
  getBattingLeaders,
  comparePlayersCommonGames,
} from '../../api/leaders.api'

import './ComparePlayersPage.css'

function ComparePlayersPage({ admin = false }) {
  const { tenantSlug } = useParams()
  const Layout = admin
  ? DashboardLayout
  : PublicLayout

  const [players, setPlayers] = useState([])
  const [comparisonPlayers, setComparisonPlayers] = useState([])

  const [playerOneId, setPlayerOneId] = useState('')
  const [playerTwoId, setPlayerTwoId] = useState('')

  const [compareMode, setCompareMode] = useState('common_equal_ab')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPlayers()
  }, [tenantSlug])

  useEffect(() => {
    loadComparison()
  }, [playerOneId, playerTwoId, compareMode, players, tenantSlug])

  const loadPlayers = async () => {
    try {
      setMessage('')

      const res = await getBattingLeaders(tenantSlug)

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.leaders || []

      setPlayers(data)
    } catch (error) {
      console.log(error)
      setPlayers([])
      setMessage('No se pudieron cargar los jugadores.')
    }
  }

  const loadComparison = async () => {
    try {
      setMessage('')
      setComparisonPlayers([])

      if (!playerOneId || !playerTwoId) return

      if (String(playerOneId) === String(playerTwoId)) {
        setMessage('Selecciona dos jugadores diferentes.')
        return
      }

      setLoading(true)

      if (compareMode === 'general') {
        const playerOneGeneral = players.find(
          (player) => String(player.id) === String(playerOneId)
        )

        const playerTwoGeneral = players.find(
          (player) => String(player.id) === String(playerTwoId)
        )

        if (!playerOneGeneral || !playerTwoGeneral) return

        setComparisonPlayers([
          {
            ...playerOneGeneral,
            player_id: playerOneGeneral.id,
            compared_ab: playerOneGeneral.ab,
            adjusted_hits: playerOneGeneral.h,
          },
          {
            ...playerTwoGeneral,
            player_id: playerTwoGeneral.id,
            compared_ab: playerTwoGeneral.ab,
            adjusted_hits: playerTwoGeneral.h,
          },
        ])

        return
      }

      const res = await comparePlayersCommonGames(
        playerOneId,
        playerTwoId,
        compareMode === 'common_equal_ab',
        tenantSlug
      )

      const data = res.data.players || []

      if (data.length < 2) {
        setMessage(
          'Estos jugadores no tienen juegos en común registrados para comparar.'
        )
      }

      setComparisonPlayers(data)
    } catch (error) {
      console.log(error)
      setMessage('Error comparando jugadores.')
    } finally {
      setLoading(false)
    }
  }

  const playerOne = useMemo(() => {
    return comparisonPlayers.find(
      (player) => String(player.player_id) === String(playerOneId)
    )
  }, [comparisonPlayers, playerOneId])

  const playerTwo = useMemo(() => {
    return comparisonPlayers.find(
      (player) => String(player.player_id) === String(playerTwoId)
    )
  }, [comparisonPlayers, playerTwoId])

  const isEqualAbMode = compareMode === 'common_equal_ab'

  const formatDecimal = (value) => {
    const number = Number(value || 0)

    return number
      .toFixed(3)
      .replace(/^0/, '')
  }

  const formatValue = (value, format) => {
    if (format === 'decimal') return formatDecimal(value)

    if (format === 'two') return Number(value || 0).toFixed(2)

    return value || 0
  }

  const getWinnerClass = (valueOne, valueTwo, lowerIsBetter = false) => {
    const one = Number(valueOne || 0)
    const two = Number(valueTwo || 0)

    if (one === two) return 'tie'

    if (lowerIsBetter) return one < two ? 'winner' : 'loser'

    return one > two ? 'winner' : 'loser'
  }

  const getSecondWinnerClass = (valueOne, valueTwo, lowerIsBetter = false) => {
    const one = Number(valueOne || 0)
    const two = Number(valueTwo || 0)

    if (one === two) return 'tie'

    if (lowerIsBetter) return two < one ? 'winner' : 'loser'

    return two > one ? 'winner' : 'loser'
  }

  const stats = useMemo(() => {
    if (!playerOne || !playerTwo) return []

    return [
      {
        label: 'AVG',
        name: 'Promedio',
        one: playerOne.avg,
        two: playerTwo.avg,
        format: 'decimal',
      },
      {
        label: 'OBP',
        name: 'En base',
        one: playerOne.obp,
        two: playerTwo.obp,
        format: 'decimal',
      },
      {
        label: 'SLG',
        name: 'Slugging',
        one: playerOne.slg,
        two: playerTwo.slg,
        format: 'decimal',
      },
      {
        label: 'OPS',
        name: 'OBP + SLG',
        one: playerOne.ops,
        two: playerTwo.ops,
        format: 'decimal',
      },
      {
        label: compareMode === 'general' ? 'G' : 'GC',
        name: compareMode === 'general' ? 'Juegos totales' : 'Juegos comunes',
        one: playerOne.games_played,
        two: playerTwo.games_played,
      },
      {
        label: isEqualAbMode ? 'AB usado' : 'AB',
        name: isEqualAbMode ? 'Turnos igualados' : 'Turnos oficiales',
        one: isEqualAbMode ? playerOne.compared_ab : playerOne.ab,
        two: isEqualAbMode ? playerTwo.compared_ab : playerTwo.ab,
      },
      {
        label: isEqualAbMode ? 'H ajustados' : 'H',
        name: isEqualAbMode ? 'Hits normalizados' : 'Hits',
        one: isEqualAbMode ? playerOne.adjusted_hits : playerOne.h,
        two: isEqualAbMode ? playerTwo.adjusted_hits : playerTwo.h,
        format: isEqualAbMode ? 'two' : undefined,
      },
      {
        label: '2B',
        name: 'Dobles',
        one: playerOne.doubles,
        two: playerTwo.doubles,
      },
      {
        label: '3B',
        name: 'Triples',
        one: playerOne.triples,
        two: playerTwo.triples,
      },
      {
        label: 'HR',
        name: 'Jonrones',
        one: playerOne.hr,
        two: playerTwo.hr,
      },
      {
        label: 'RBI',
        name: 'Empujadas',
        one: playerOne.rbi,
        two: playerTwo.rbi,
      },
      {
        label: 'R',
        name: 'Anotadas',
        one: playerOne.runs,
        two: playerTwo.runs,
      },
      {
        label: 'BB',
        name: 'Bases por bolas',
        one: playerOne.bb,
        two: playerTwo.bb,
      },
      {
        label: 'SO',
        name: 'Ponches',
        one: playerOne.so,
        two: playerTwo.so,
        lowerIsBetter: true,
      },
      {
        label: 'SB',
        name: 'Bases robadas',
        one: playerOne.sb,
        two: playerTwo.sb,
      },
      {
        label: 'CS',
        name: 'Cogido robando',
        one: playerOne.cs,
        two: playerTwo.cs,
        lowerIsBetter: true,
      },
      {
        label: 'TB',
        name: 'Total de bases',
        one: playerOne.tb,
        two: playerTwo.tb,
      },
    ]
  }, [playerOne, playerTwo, compareMode, isEqualAbMode])

  const score = useMemo(() => {
    let one = 0
    let two = 0

    stats.forEach((stat) => {
      const first = Number(stat.one || 0)
      const second = Number(stat.two || 0)

      if (first === second) return

      if (stat.lowerIsBetter) {
        if (first < second) one += 1
        if (second < first) two += 1
      } else {
        if (first > second) one += 1
        if (second > first) two += 1
      }
    })

    return { one, two }
  }, [stats])

  const resultText = useMemo(() => {
    if (!playerOne || !playerTwo) return 'Resultado'

    if (score.one === score.two) return 'Comparación empatada'

    if (score.one > score.two) {
      return `${playerOne.full_name} domina`
    }

    return `${playerTwo.full_name} domina`
  }, [score, playerOne, playerTwo])

  return (
  <Layout tenantSlug={tenantSlug}>
      <section className="compare-page">
        <div className="compare-header">
          <span className="compare-kicker">
            DiamondStats Matchup
          </span>

          <h1>
            Comparar Jugadores
          </h1>

          <p>
            Compara jugadores de forma general, por juegos comunes o con turnos
            igualados para una medición más justa.
          </p>
        </div>

        <div className="compare-select-card">
          <div className="compare-select-box">
            <label>
              Jugador 1
            </label>

            <select
              value={playerOneId}
              onChange={(e) => setPlayerOneId(e.target.value)}
            >
              <option value="">
                Seleccionar jugador
              </option>

              {players.map((player) => (
                <option
                  key={player.id}
                  value={player.id}
                >
                  {player.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="compare-vs">
            VS
          </div>

          <div className="compare-select-box">
            <label>
              Jugador 2
            </label>

            <select
              value={playerTwoId}
              onChange={(e) => setPlayerTwoId(e.target.value)}
            >
              <option value="">
                Seleccionar jugador
              </option>

              {players.map((player) => (
                <option
                  key={player.id}
                  value={player.id}
                >
                  {player.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="compare-mode-card">
          <div className="compare-mode-options">
            <button
              type="button"
              className={compareMode === 'general' ? 'active' : ''}
              onClick={() => setCompareMode('general')}
            >
              General
            </button>

            <button
              type="button"
              className={compareMode === 'common_games' ? 'active' : ''}
              onClick={() => setCompareMode('common_games')}
            >
              Mismos juegos
            </button>

            <button
              type="button"
              className={compareMode === 'common_equal_ab' ? 'active' : ''}
              onClick={() => setCompareMode('common_equal_ab')}
            >
              Mismos juegos + turnos iguales
            </button>
          </div>

          <p>
            {compareMode === 'general' &&
              'Modo general: compara todas las estadísticas acumuladas de cada jugador.'}

            {compareMode === 'common_games' &&
              'Modo juegos comunes: compara solo partidos donde ambos participaron.'}

            {compareMode === 'common_equal_ab' &&
              'Modo justo: compara mismos juegos y normaliza por la menor cantidad de turnos.'}
          </p>
        </div>

        {loading && (
          <div className="compare-message">
            Calculando comparación...
          </div>
        )}

        {message && !loading && (
          <div className="compare-message warning">
            {message}
          </div>
        )}

        {!playerOne && !playerTwo && !message && !loading && (
          <div className="compare-empty">
            <h2>
              Selecciona dos jugadores
            </h2>

            <p>
              La comparación aparecerá aquí cuando elijas ambos jugadores.
            </p>
          </div>
        )}

        {playerOne && playerTwo && !loading && (
          <>
            <div className="compare-player-cards">
              <div className="compare-player-card">
                <img
                  src={
                    playerOne.photo_url ||
                    'https://placehold.co/300x300?text=PLAYER'
                  }
                  alt={playerOne.full_name}
                />

                <h2>
                  {playerOne.full_name}
                </h2>

                <p>
                  {playerOne.team_name || 'Sin equipo'} • {playerOne.position || '-'}
                </p>

                <strong>
                  {score.one} ventajas
                </strong>
              </div>

              <div className="compare-result-card">
                <span>
                  Resultado
                </span>

                <h2>
                  {resultText}
                </h2>

                <p>
                  {score.one} - {score.two}
                </p>

                <small>
                  {compareMode === 'general'
                    ? 'Comparación general'
                    : `${playerOne.games_played || 0} juegos comunes`}
                </small>
              </div>

              <div className="compare-player-card">
                <img
                  src={
                    playerTwo.photo_url ||
                    'https://placehold.co/300x300?text=PLAYER'
                  }
                  alt={playerTwo.full_name}
                />

                <h2>
                  {playerTwo.full_name}
                </h2>

                <p>
                  {playerTwo.team_name || 'Sin equipo'} • {playerTwo.position || '-'}
                </p>

                <strong>
                  {score.two} ventajas
                </strong>
              </div>
            </div>

            <div className="compare-summary-grid">
              <div className="compare-summary-card">
                <span>
                  {compareMode === 'general' ? 'Juegos totales' : 'Juegos comparados'}
                </span>

                <strong>
                  {playerOne.games_played || 0} / {playerTwo.games_played || 0}
                </strong>
              </div>

              <div className="compare-summary-card">
                <span>
                  Turnos reales
                </span>

                <strong>
                  {playerOne.ab || 0} / {playerTwo.ab || 0}
                </strong>
              </div>

              <div className="compare-summary-card">
                <span>
                  Turnos usados
                </span>

                <strong>
                  {isEqualAbMode
                    ? `${playerOne.compared_ab || 0} / ${playerTwo.compared_ab || 0}`
                    : `${playerOne.ab || 0} / ${playerTwo.ab || 0}`}
                </strong>
              </div>
            </div>

            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>{playerOne.full_name}</th>
                    <th>Estadística</th>
                    <th>{playerTwo.full_name}</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.label}>
                      <td
                        className={getWinnerClass(
                          stat.one,
                          stat.two,
                          stat.lowerIsBetter
                        )}
                      >
                        {formatValue(stat.one, stat.format)}
                      </td>

                      <td className="stat-label">
                        <strong>
                          {stat.label}
                        </strong>

                        <span>
                          {stat.name}
                        </span>
                      </td>

                      <td
                        className={getSecondWinnerClass(
                          stat.one,
                          stat.two,
                          stat.lowerIsBetter
                        )}
                      >
                        {formatValue(stat.two, stat.format)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </Layout>
  )
}

export default ComparePlayersPage