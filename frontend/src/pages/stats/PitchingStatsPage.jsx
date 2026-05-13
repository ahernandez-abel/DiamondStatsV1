import { useEffect, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getPitchingLeaders } from '../../api/leaders.api'

import './PitchingStatsPage.css'

function PitchingStatsPage() {

  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {

    try {

      const res = await getPitchingLeaders()

      setLeaders(res.data.leaders || [])

    } catch (error) {

      console.log(error)
    }
  }

  return (
    <PublicLayout>

      <section className="pitching-page">

        <div className="pitching-header">

          <h1 className="pitching-title">
            Líderes de Pitcheo
          </h1>

          <p className="pitching-subtitle">
            Estadísticas acumuladas de pitcheo
          </p>

        </div>

        <div className="pitching-table-wrapper">

          <table className="pitching-table">

            <thead>

              <tr>

                <th>
                  Lanzador
                </th>

                <th>
                  ERA
                </th>

                <th>
                  WHIP
                </th>

                <th>
                  IP
                </th>

                <th>
                  SO
                </th>

                <th>
                  BB
                </th>

                <th>
                  H
                </th>

                <th>
                  ER
                </th>

                <th>
                  R
                </th>

                <th>
                  HR
                </th>

                <th>
                  HBP
                </th>

                <th>
                  K/7
                </th>

                <th>
                  BB/7
                </th>

                <th>
                  H/7
                </th>

              </tr>

            </thead>

            <tbody>

              {leaders.map((player) => (

                <tr key={player.id}>

                  <td className="pitcher-cell">

                    <div className="pitcher-info">

                      <img
                        src={
                          player.photo_url ||
                          'https://placehold.co/80x80'
                        }
                        alt={player.full_name}
                        className="pitcher-photo"
                      />

                      <span className="pitcher-name">
                        {player.full_name}
                      </span>

                    </div>

                  </td>

                  <td className="era-cell">
                    {player.era}
                  </td>

                  <td className="whip-cell">
                    {player.whip}
                  </td>

                  <td>
                    {player.ip}
                  </td>

                  <td>
                    {player.strikeouts}
                  </td>

                  <td>
                    {player.walks}
                  </td>

                  <td>
                    {player.hits_allowed}
                  </td>

                  <td>
                    {player.earned_runs}
                  </td>

                  <td>
                    {player.runs_allowed}
                  </td>

                  <td>
                    {player.hr_allowed}
                  </td>

                  <td>
                    {player.hbp}
                  </td>

                  <td>
                    {player.k_per_7}
                  </td>

                  <td>
                    {player.bb_per_7}
                  </td>

                  <td>
                    {player.h_per_7}
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

export default PitchingStatsPage