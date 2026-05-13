import { useEffect, useMemo, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getBattingLeaders } from '../../api/leaders.api'

import './ComparePlayersPage.css'

function ComparePlayersPage() {

  const [players, setPlayers] = useState([])
  const [playerOneId, setPlayerOneId] = useState('')
  const [playerTwoId, setPlayerTwoId] = useState('')

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      const res = await getBattingLeaders()
      setPlayers(res.data.leaders || [])
    } catch (error) {
      console.log(error)
    }
  }

  const playerOne = useMemo(() => {
    return players.find(
      (player) => String(player.id) === String(playerOneId)
    )
  }, [players, playerOneId])

  const playerTwo = useMemo(() => {
    return players.find(
      (player) => String(player.id) === String(playerTwoId)
    )
  }, [players, playerTwoId])

  const formatDecimal = (value) => {
    const number = Number(value || 0)

    return number
      .toFixed(3)
      .replace(/^0/, '')
  }

  const formatValue = (value, format) => {
    if (format === 'decimal') {
      return formatDecimal(value)
    }

    if (format === 'two') {
      return Number(value || 0).toFixed(2)
    }

    return value || 0
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
        one: playerOne.avg,
        two: playerTwo.avg,
        format: 'decimal',
      },
      {
        label: 'OBP',
        one: playerOne.obp,
        two: playerTwo.obp,
        format: 'decimal',
      },
      {
        label: 'SLG',
        one: playerOne.slg,
        two: playerTwo.slg,
        format: 'decimal',
      },
      {
        label: 'OPS',
        one: playerOne.ops,
        two: playerTwo.ops,
        format: 'decimal',
      },
      {
        label: 'G',
        one: playerOne.games_played,
        two: playerTwo.games_played,
      },
      {
        label: 'AB',
        one: playerOne.ab,
        two: playerTwo.ab,
      },
      {
        label: 'H',
        one: playerOne.h,
        two: playerTwo.h,
      },
      {
        label: '2B',
        one: playerOne.doubles,
        two: playerTwo.doubles,
      },
      {
        label: '3B',
        one: playerOne.triples,
        two: playerTwo.triples,
      },
      {
        label: 'HR',
        one: playerOne.hr,
        two: playerTwo.hr,
      },
      {
        label: 'RBI',
        one: playerOne.rbi,
        two: playerTwo.rbi,
      },
      {
        label: 'R',
        one: playerOne.runs,
        two: playerTwo.runs,
      },
      {
        label: 'BB',
        one: playerOne.bb,
        two: playerTwo.bb,
      },
      {
        label: 'SO',
        one: playerOne.so,
        two: playerTwo.so,
        lowerIsBetter: true,
      },
      {
        label: 'SB',
        one: playerOne.sb,
        two: playerTwo.sb,
      },
      {
        label: 'CS',
        one: playerOne.cs,
        two: playerTwo.cs,
        lowerIsBetter: true,
      },
      {
        label: 'TB',
        one: playerOne.tb,
        two: playerTwo.tb,
      },
    ]
  }, [playerOne, playerTwo])

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
            Elige dos jugadores y compara sus estadísticas ofensivas frente a frente.
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
                        {formatValue(stat.one, stat.format)}
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