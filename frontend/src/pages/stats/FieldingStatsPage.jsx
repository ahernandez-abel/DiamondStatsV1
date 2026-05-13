import { useEffect, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getFieldingLeaders } from '../../api/leaders.api'

import './FieldingStatsPage.css'

function FieldingStatsPage() {

  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {

    try {

      const res = await getFieldingLeaders()

      setLeaders(res.data.leaders || [])

    } catch (error) {

      console.log(error)
    }
  }

  return (
    <PublicLayout>

      <section className="fielding-page">

        <div className="fielding-header">

          <h1 className="fielding-title">
            Líderes Defensivos
          </h1>

          <p className="fielding-subtitle">
            Estadísticas acumuladas defensivas
          </p>

        </div>

        <div className="fielding-table-wrapper">

          <table className="fielding-table">

            <thead>

              <tr>

                <th>
                  Jugador
                </th>

                <th>
                  FLD%
                </th>

                <th>
                  PO
                </th>

                <th>
                  AST
                </th>

                <th>
                  ERR
                </th>

                <th>
                  PB
                </th>

                <th>
                  TC
                </th>

                <th>
                  RF
                </th>

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

                      <span className="player-name">
                        {player.full_name}
                      </span>

                    </div>

                  </td>

                  <td className="fielding-pct">
                    {player.fielding_pct}
                  </td>

                  <td>
                    {player.putouts}
                  </td>

                  <td>
                    {player.assists}
                  </td>

                  <td>
                    {player.errors}
                  </td>

                  <td>
                    {player.passed_balls}
                  </td>

                  <td>
                    {player.total_chances}
                  </td>

                  <td className="rf-cell">
                    {player.range_factor}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </PublicLayout>
  )
}

export default FieldingStatsPage