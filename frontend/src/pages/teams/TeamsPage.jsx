import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import PublicLayout from '../../layouts/PublicLayout'

import { getTeams } from '../../api/teams.api'
import { getGames } from '../../api/games.api'
import { getPublicHome } from '../../api/public.api'

import './TeamsPage.css'

function TeamsPage() {
  const { tenantSlug } = useParams()

  const [teams, setTeams] = useState([])
  const [games, setGames] = useState([])
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    loadData()
  }, [tenantSlug])

  const loadData = async () => {
    try {
      if (tenantSlug) {
        const res = await getPublicHome(tenantSlug)

        setTenant(res.data.tenant || null)
        setTeams(res.data.teams || [])
        setGames(res.data.games || [])

        return
      }

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
      setTeams([])
      setGames([])
    }
  }

  const mainTeam =
    teams.find((team) => team.is_main === true) ||
    teams.find((team) => team.is_main === 'true') ||
    null

  const finishedGames = games.filter(
    (game) =>
      game.status === 'final' ||
      game.status === 'completed'
  )

  const mainTeamGames = mainTeam
    ? finishedGames.filter(
        (game) =>
          Number(game.home_team_id) === Number(mainTeam.id) ||
          Number(game.away_team_id) === Number(mainTeam.id)
      )
    : []

  const getMainTeamResult = (game) => {
    if (!mainTeam) return 'N/A'

    const isHome = Number(game.home_team_id) === Number(mainTeam.id)

    const myScore = Number(isHome ? game.home_score : game.away_score)
    const rivalScore = Number(isHome ? game.away_score : game.home_score)

    if (myScore > rivalScore) return 'Victoria'
    if (myScore < rivalScore) return 'Derrota'

    return 'Empate'
  }

  const getTeamRecord = (team) => {
    const teamGames = finishedGames.filter(
      (game) =>
        Number(game.home_team_id) === Number(team.id) ||
        Number(game.away_team_id) === Number(team.id)
    )

    return teamGames.reduce(
      (record, game) => {
        const isHome = Number(game.home_team_id) === Number(team.id)

        const teamScore = Number(isHome ? game.home_score : game.away_score)
        const rivalScore = Number(isHome ? game.away_score : game.home_score)

        if (teamScore > rivalScore) {
          record.wins += 1
        }

        if (teamScore < rivalScore) {
          record.losses += 1
        }

        return record
      },
      {
        wins: 0,
        losses: 0,
      }
    )
  }

  const mainTeamRecord = mainTeam
    ? getTeamRecord(mainTeam)
    : {
        wins: 0,
        losses: 0,
      }

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <section className="teams-page">
        <div className="teams-header">
          <span className="players-badge">
            {tenant?.name || 'DiamondStats Teams'}
          </span>

          <h1 className="teams-title">
            Equipo
          </h1>

          <p className="teams-subtitle">
            Récord principal, resultados jugados y récord de los equipos.
          </p>
        </div>

        {mainTeam ? (
          <div className="main-team-panel">
            <div className="main-team-info">
              <img
                src={mainTeam.logo_url || 'https://placehold.co/120x120'}
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
                <strong>{mainTeamRecord.wins}</strong>
              </div>

              <div className="main-record-box loss">
                <span>Derrotas</span>
                <strong>{mainTeamRecord.losses}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-results">
            No hay equipo principal configurado.
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
                <div key={game.id} className="result-card">
                  <div>
                    <h3>
                      {game.home_team_name || 'Home'} vs {game.away_team_name || 'Away'}
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
                      {game.home_score ?? '-'} - {game.away_score ?? '-'}
                    </strong>

                    <span>
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
            Todos los Equipos
          </h2>

          <div className="teams-grid">
            {teams.map((team) => {
              const teamRecord = getTeamRecord(team)

              return (
                <div
                  key={team.id}
                  className={
                    team.is_main === true || team.is_main === 'true'
                      ? 'team-card main-team-card'
                      : 'team-card'
                  }
                >
                  <img
                    src={team.logo_url || 'https://placehold.co/100x100'}
                    alt={team.name}
                    className="team-logo"
                  />

                  <h3>
                    {team.name}
                  </h3>

                  <p>
                    {team.city || 'Sin ciudad'}
                  </p>

                  <div className="team-record">
                    <span>
                      W: {teamRecord.wins}
                    </span>

                    <span>
                      L: {teamRecord.losses}
                    </span>
                  </div>

                  {(team.is_main === true || team.is_main === 'true') && (
                    <span className="team-main-badge">
                      Principal
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default TeamsPage