import { useEffect, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getBattingLeaders } from '../../api/leaders.api'

import './BattingStatsPage.css'

function BattingStatsPage() {

  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {
    try {
      const res = await getBattingLeaders()
      setLeaders(res.data.leaders || [])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <PublicLayout>

      <section className="batting-page">

        <div className="batting-header">

          <h1 className="batting-title">
            Líderes Ofensivos
          </h1>

          <p className="batting-subtitle">
            Estadísticas acumuladas de bateo
          </p>

        </div>

        <div className="batting-table-wrapper">

          <table className="batting-table">

            <thead>
              <tr>
                <th>Jugador</th>
                <th>G</th>
                <th>AB</th>
                <th>H</th>
                <th>2B</th>
                <th>3B</th>
                <th>HR</th>
                <th>RBI</th>
                <th>R</th>
                <th>BB</th>
                <th>SO</th>
                <th>SB</th>
                <th>CS</th>
                <th>TB</th>
                <th>AVG</th>
                <th>OBP</th>
                <th>SLG</th>
                <th>OPS</th>
              </tr>
            </thead>

            <tbody>

              {leaders.map((player) => (

                <tr key={player.id}>

                  <td className="player-cell">

                    <div className="player-info">

                      <img
                        src={
                          player.photo_url ||
                          'https://placehold.co/80x80'
                        }
                        alt={player.full_name}
                        className="player-photo"
                      />

                      <span>
                        {player.full_name}
                      </span>

                    </div>

                  </td>

                  <td>{player.games_played}</td>
                  <td>{player.ab}</td>
                  <td>{player.h}</td>

                  <td className="avg-cell">
                    {player.avg}
                  </td>

                  <td>{player.obp}</td>
                  <td>{player.slg}</td>

                  <td className="ops-cell">
                    {player.ops}
                  </td>

                  <td>{player.doubles}</td>
                  <td>{player.triples}</td>
                  <td>{player.hr}</td>
                  <td>{player.rbi}</td>
                  <td>{player.runs}</td>
                  <td>{player.bb}</td>
                  <td>{player.so}</td>
                  <td>{player.sb}</td>
                  <td>{player.cs}</td>
                  <td>{player.tb}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </PublicLayout>
  )
}

export default BattingStatsPage