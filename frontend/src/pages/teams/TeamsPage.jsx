import { useEffect, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import { getTeams } from '../../api/teams.api'
import { getGames } from '../../api/games.api'

import './TeamsPage.css'

const MAIN_TEAM_ID = 1

function TeamsPage() {

  const [teams, setTeams] = useState([])
  const [games, setGames] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
  try {
    const teamsRes = await getTeams()
    const gamesRes = await getGames()

    setTeams(teamsRes.data.teams || [])

    const gamesData =
      gamesRes.data.games ||
      gamesRes.data.data ||
      gamesRes.data ||
      []

    setGames(Array.isArray(gamesData) ? gamesData : [])
  } catch (error) {
    console.log(error)
  }
}

  const mainTeam = teams.find(
    (team) => Number(team.id) === MAIN_TEAM_ID
  )

  const finishedGames = games.filter(
    (game) => game.status === 'final'
  )

  const mainTeamGames = finishedGames.filter(
    (game) =>
      Number(game.home_team_id) === MAIN_TEAM_ID ||
      Number(game.away_team_id) === MAIN_TEAM_ID
  )

  const getMainTeamResult = (game) => {
    const isHome = Number(game.home_team_id) === MAIN_TEAM_ID

    const myScore = isHome
      ? game.home_score
      : game.away_score

    const rivalScore = isHome
      ? game.away_score
      : game.home_score

    if (myScore > rivalScore) return 'Victoria'
    if (myScore < rivalScore) return 'Derrota'

    return 'Empate'
  }

  return (
    <PublicLayout>

      <section className="teams-page">

        <div className="teams-header">

          <h1 className="teams-title">
            Equipo
          </h1>

          <p className="teams-subtitle">
            Récord principal, resultados jugados y récord de los equipos
          </p>

        </div>

        {mainTeam && (
          <div className="main-team-panel">

            <div className="main-team-info">

              <img
                src={
                  mainTeam.logo_url ||
                  'https://placehold.co/120x120'
                }
                alt={mainTeam.name}
                className="main-team-logo"
              />

              <div>

                <span className="main-team-label">
                  Equipo Principal
                </span>

                <h2>
                  {mainTeam.name}
                </h2>

                <p>
                  {mainTeam.city || 'Sin ciudad'}
                </p>

              </div>

            </div>

            <div className="main-record">

              <div className="main-record-box win">
                <span>Victorias</span>
                <strong>{mainTeam.wins || 0}</strong>
              </div>

              <div className="main-record-box loss">
                <span>Derrotas</span>
                <strong>{mainTeam.losses || 0}</strong>
              </div>

            </div>

          </div>
        )}

        <div className="section-block">

          <h2 className="section-title">
            Resultados del Equipo
          </h2>

          <div className="games-results-list">

            {mainTeamGames.length === 0 ? (

              <div className="empty-results">
                No hay resultados finalizados todavía.
              </div>

            ) : (

              mainTeamGames.map((game) => (

                <div
                  key={game.id}
                  className="result-card"
                >

                  <div>

                    <h3>
                      {game.home_team_name || 'Home'}
                      {' '}vs{' '}
                      {game.away_team_name || 'Away'}
                    </h3>

                    <p>
                      Fecha: {game.game_date}
                    </p>

                    <p>
                      Lugar: {game.venue || 'Sin estadio'}
                    </p>

                  </div>

                  <div className="result-score">

                    <strong>
                      {game.home_score} - {game.away_score}
                    </strong>

                    <span
                      className={
                        getMainTeamResult(game) === 'Victoria'
                          ? 'result-win'
                          : getMainTeamResult(game) === 'Derrota'
                            ? 'result-loss'
                            : 'result-draw'
                      }
                    >
                      {getMainTeamResult(game)}
                    </span>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        <div className="section-block">

          <h2 className="section-title">
            Récord de Equipos
          </h2>

          <div className="teams-grid">

            {teams.map((team) => (

              <div
                key={team.id}
                className={
                  Number(team.id) === MAIN_TEAM_ID
                    ? 'team-card active-team'
                    : 'team-card'
                }
              >

                <div className="team-card-header">

                  <img
                    src={
                      team.logo_url ||
                      'https://placehold.co/100x100'
                    }
                    alt={team.name}
                    className="team-logo"
                  />

                  <div>

                    <h2 className="team-name">
                      {team.name}
                    </h2>

                    <p className="team-city">
                      {team.city || 'Sin ciudad'}
                    </p>

                  </div>

                </div>

                <div className="team-record">

                  <div className="record-box win-box">
                    <span>W</span>
                    <strong>{team.wins || 0}</strong>
                  </div>

                  <div className="record-box loss-box">
                    <span>L</span>
                    <strong>{team.losses || 0}</strong>
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </PublicLayout>
  )
}

export default TeamsPage