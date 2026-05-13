import { useEffect, useMemo, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getPlayers } from '../../api/players.api'
import { getPlayerById } from '../../api/players.api'

import './ComparePlayersPage.css'

function ComparePlayersPage() {

  const [players, setPlayers] = useState([])
  const [playerOneId, setPlayerOneId] = useState('')
  const [playerTwoId, setPlayerTwoId] = useState('')
  const [playerOne, setPlayerOne] = useState(null)
  const [playerTwo, setPlayerTwo] = useState(null)

  useEffect(() => {
    loadPlayers()
  }, [])

  useEffect(() => {
    loadComparison()
  }, [playerOneId, playerTwoId])

  const loadPlayers = async () => {
    try {
      const res = await getPlayers()
      setPlayers(res.data.players || [])
    } catch (error) {
      console.log(error)
    }
  }

  const loadComparison = async () => {
    try {
      if (!playerOneId || !playerTwoId) return

      const [resOne, resTwo] = await Promise.all([
        getPlayerById(playerOneId),
        getPlayerById(playerTwoId),
      ])

      setPlayerOne(resOne.data.player)
      setPlayerTwo(resTwo.data.player)

    } catch (error) {
      console.log(error)
    }
  }

  const formatDecimal = (value) => {
    const number = Number(value || 0)

    return number.toFixed(3)
  }

  const getWinnerClass = (valueOne, valueTwo, lowerIsBetter = false) => {
    const one = Number(valueOne || 0)
    const two = Number(valueTwo || 0)

    if (one === two) return 'tie'

    if (lowerIsBetter) {
      return one < two ? 'winner' : 'loser'
    }

    return one > two ? 'winner' : 'loser'
  }

  const getSecondWinnerClass = (valueOne, valueTwo, lowerIsBetter = false) => {
    const one = Number(valueOne || 0)
    const two = Number(valueTwo || 0)

    if (one === two) return 'tie'

    if (lowerIsBetter) {
      return two < one ? 'winner' : 'loser'
    }

    return two > one ? 'winner' : 'loser'
  }

  const stats = useMemo(() => {
    if (!playerOne || !playerTwo) return []

    return [
      {
        label: 'AVG',
        one: playerOne.batting?.avg,
        two: playerTwo.batting?.avg,
        format: 'decimal',
      },
      {
        label: 'OBP',
        one: playerOne.batting?.obp,
        two: playerTwo.batting?.obp,
        format: 'decimal',
      },
      {
        label: 'SLG',
        one: playerOne.batting?.slg,
        two: playerTwo.batting?.slg,
        format: 'decimal',
      },
      {
        label: 'OPS',
        one: playerOne.batting?.ops,
        two: playerTwo.batting?.ops,
        format: 'decimal',
      },
      {
        label: 'H',
        one: playerOne.batting?.hits,
        two: playerTwo.batting?.hits,
      },
      {
        label: 'HR',
        one: playerOne.batting?.hr,
        two: playerTwo.batting?.hr,
      },
      {
        label: 'RBI',
        one: playerOne.batting?.rbi,
        two: playerTwo.batting?.rbi,
      },
      {
        label: 'R',
        one: playerOne.batting?.runs,
        two: playerTwo.batting?.runs,
      },
      {
        label: 'SB',
        one: playerOne.batting?.sb,
        two: playerTwo.batting?.sb,
      },
      {
        label: 'ERA',
        one: playerOne.pitching?.era,
        two: playerTwo.pitching?.era,
        format: 'two',
        lowerIsBetter: true,
      },
      {
        label: 'WHIP',
        one: playerOne.pitching?.whip,
        two: playerTwo.pitching?.whip,
        format: 'two',
        lowerIsBetter: true,
      },
      {
        label: 'SO Pitching',
        one: playerOne.pitching?.strikeouts,
        two: playerTwo.pitching?.strikeouts,
      },
      {
        label: 'FLD%',
        one: playerOne.fielding?.fielding_pct,
        two: playerTwo.fielding?.fielding_pct,
        format: 'decimal',
      },
      {
        label: 'PO',
        one: playerOne.fielding?.putouts,
        two: playerTwo.fielding?.putouts,
      },
      {
        label: 'AST',
        one: playerOne.fielding?.assists,
        two: playerTwo.fielding?.assists,
      },
      {
        label: 'ERR',
        one: playerOne.fielding?.errors,
        two: playerTwo.fielding?.errors,
        lowerIsBetter: true,
      },
    ]
  }, [playerOne, playerTwo])

  const formatValue = (stat) => {
    if (stat.format === 'decimal') {
      return formatDecimal(stat.value)
    }

    if (stat.format === 'two') {
      return Number(stat.value || 0).toFixed(2)
    }

    return stat.value || 0
  }

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

  return (
    <PublicLayout>

      <section className="compare-page">

        <div className="compare-header">

          <h1>
            Comparar Jugadores
          </h1>

          <p>
            Elige dos jugadores y compara sus estadísticas frente a frente.
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

        {playerOne && playerTwo && (

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
                  {score.one} puntos
                </strong>

              </div>

              <div className="compare-result-card">

                <span>
                  Resultado
                </span>

                <h2>
                  {score.one === score.two
                    ? 'Empate'
                    : score.one > score.two
                      ? `${playerOne.full_name} domina`
                      : `${playerTwo.full_name} domina`}
                </h2>

                <p>
                  {score.one} - {score.two}
                </p>

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
                  {score.two} puntos
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
                        {formatValue({
                          value: stat.one,
                          format: stat.format,
                        })}
                      </td>

                      <td className="stat-label">
                        {stat.label}
                      </td>

                      <td
                        className={getSecondWinnerClass(
                          stat.one,
                          stat.two,
                          stat.lowerIsBetter
                        )}
                      >
                        {formatValue({
                          value: stat.two,
                          format: stat.format,
                        })}
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