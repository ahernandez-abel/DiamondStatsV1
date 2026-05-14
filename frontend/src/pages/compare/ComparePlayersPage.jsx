import { useEffect, useMemo, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import {
  getBattingLeaders,
  comparePlayersCommonGames,
} from '../../api/leaders.api'

import './ComparePlayersPage.css'

function ComparePlayersPage() {
  const [players, setPlayers] = useState([])
  const [comparisonPlayers, setComparisonPlayers] = useState([])

  const [playerOneId, setPlayerOneId] = useState('')
  const [playerTwoId, setPlayerTwoId] = useState('')

  const [equalAb, setEqualAb] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPlayers()
  }, [])

  useEffect(() => {
    loadComparison()
  }, [playerOneId, playerTwoId, equalAb])

  const loadPlayers = async () => {
    try {
      const res = await getBattingLeaders()
      setPlayers(res.data.leaders || [])
    } catch (error) {
      console.log(error)
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

      const res = await comparePlayersCommonGames(
        playerOneId,
        playerTwoId,
        equalAb
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
      setMessage('Error comparando jugadores en juegos comunes.')
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
        label: 'G',
        name: 'Juegos comunes',
        one: playerOne.games_played,
        two: playerTwo.games_played,
      },
      {
        label: equalAb ? 'AB usado' : 'AB',
        name: equalAb ? 'Turnos igualados' : 'Turnos oficiales',
        one: equalAb ? playerOne.compared_ab : playerOne.ab,
        two: equalAb ? playerTwo.compared_ab : playerTwo.ab,
      },
      {
        label: equalAb ? 'H ajustados' : 'H',
        name: equalAb ? 'Hits normalizados' : 'Hits',
        one: equalAb ? playerOne.adjusted_hits : playerOne.h,
        two: equalAb ? playerTwo.adjusted_hits : playerTwo.h,
        format: equalAb ? 'two' : undefined,
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
  }, [playerOne, playerTwo, equalAb])

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
    <PublicLayout>
      <section className="compare-page">

        <div className="compare-header">
          <span className="compare-kicker">
            DiamondStats Matchup
          </span>

          <h1>
            Comparar Jugadores
          </h1>

          <p>
            Compara dos jugadores usando solo los juegos donde ambos participaron.
            También puedes igualar los turnos para una comparación más justa.
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

          <label className="compare-checkbox">
            <input
              type="checkbox"
              checked={equalAb}
              onChange={(e) => setEqualAb(e.target.checked)}
            />

            <span>
              Igualar turnos
            </span>
          </label>

          <p>
            {equalAb
              ? 'Modo justo activo: se comparan los mismos juegos y se normaliza por la menor cantidad de turnos.'
              : 'Modo juegos comunes: se comparan solo los partidos donde ambos jugadores participaron.'}
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
                  {playerOne.games_played || 0} juegos comunes
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
                  Juegos comparados
                </span>

                <strong>
                  {playerOne.games_played || 0}
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
                  {equalAb
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
    </PublicLayout>
  )
}

export default ComparePlayersPage