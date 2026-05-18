import { useEffect, useMemo, useState } from 'react'
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

  const [teamSearch, setTeamSearch] = useState('')
  const [teamType, setTeamType] = useState('')
  const [resultsSearch, setResultsSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

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

  const getMainTeamResult = (game) => {
    if (!mainTeam) return 'N/A'

    const isHome = Number(game.home_team_id) === Number(mainTeam.id)

    const myScore = Number(isHome ? game.home_score : game.away_score)
    const rivalScore = Number(isHome ? game.away_score : game.home_score)

    if (myScore > rivalScore) return 'Victoria'
    if (myScore < rivalScore) return 'Derrota'

    return 'Empate'
  }

  const getResultClass = (result) => {
    if (result === 'Victoria') return 'result-win'
    if (result === 'Derrota') return 'result-loss'
    return 'result-draw'
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

        if (teamScore > rivalScore) record.wins += 1
        if (teamScore < rivalScore) record.losses += 1

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

  const mainTeamGames = useMemo(() => {
    if (!mainTeam) return []

    return finishedGames.filter(
      (game) => {
        const belongsToMainTeam =
          Number(game.home_team_id) === Number(mainTeam.id) ||
          Number(game.away_team_id) === Number(mainTeam.id)

        const text = `
          ${game.home_team_name || ''}
          ${game.away_team_name || ''}
          ${game.venue || ''}
          ${game.game_date || ''}
        `.toLowerCase()

        return (
          belongsToMainTeam &&
          text.includes(resultsSearch.toLowerCase())
        )
      }
    )
  }, [finishedGames, mainTeam, resultsSearch])

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const text = `
        ${team.name || ''}
        ${team.short_name || ''}
        ${team.city || ''}
        ${team.manager_name || ''}
      `.toLowerCase()

      const matchesSearch = text.includes(teamSearch.toLowerCase())

      const isMain =
        team.is_main === true ||
        team.is_main === 'true'

      const matchesType =
        !teamType ||
        (teamType === 'main' && isMain) ||
        (teamType === 'rival' && !isMain)

      return matchesSearch && matchesType
    })
  }, [teams, teamSearch, teamType])

  const totalPages = Math.max(
    Math.ceil(filteredTeams.length / limit),
    1
  )

  const paginatedTeams = filteredTeams.slice(
    (page - 1) * limit,
    page * limit
  )

  const clearTeamFilters = () => {
    setTeamSearch('')
    setTeamType('')
    setLimit(10)
    setPage(1)
  }

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <section className="teams-page">
       <div className="teams-header">

  <div className="teams-header-content">

    <span className="players-badge">
      {tenant?.name || 'DiamondStats Teams'}
    </span>

    <h1 className="teams-title">
      Equipo
    </h1>

    <p className="teams-subtitle">
      Récord principal, resultados finalizados y equipos registrados.
    </p>

  </div>

  <div className="teams-counter">

    <span>
      Total Equipos
    </span>

    <strong>
      {filteredTeams.length}
    </strong>

  </div>

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

                <h2>{mainTeam.name}</h2>

                <p>{mainTeam.city || 'Sin ciudad'}</p>
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
          <div className="section-heading">
            <h2 className="section-title">
              Resultados del Equipo
            </h2>

            <input
              type="text"
              value={resultsSearch}
              onChange={(e) => setResultsSearch(e.target.value)}
              placeholder="Buscar resultado por rival, fecha o estadio..."
              className="teams-search small"
            />
          </div>

          <div className="games-results-list">
            {mainTeamGames.length === 0 ? (
              <div className="empty-results">
                No hay resultados finalizados todavía.
              </div>
            ) : (
              mainTeamGames.map((game) => {
                const result = getMainTeamResult(game)

                return (
                  <div key={game.id} className="result-card">
                    <div>
                      <h3>
                        {game.home_team_name || 'Home'} vs {game.away_team_name || 'Away'}
                      </h3>

                      <p>Fecha: {game.game_date}</p>

                      <p>Lugar: {game.venue || 'Sin estadio'}</p>
                    </div>

                    <div className="result-score">
                      <strong>
                        {game.home_score ?? '-'} - {game.away_score ?? '-'}
                      </strong>

                      <span className={getResultClass(result)}>
                        {result}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2 className="section-title">
              Todos los Equipos
            </h2>
          </div>

          <div className="teams-filters">
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => {
                setTeamSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar equipo, ciudad o manager..."
              className="teams-search"
            />

            <select
              value={teamType}
              onChange={(e) => {
                setTeamType(e.target.value)
                setPage(1)
              }}
              className="teams-filter"
            >
              <option value="">Todos</option>
              <option value="main">Principal</option>
              <option value="rival">Rivales</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="teams-filter"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>

            <button
              type="button"
              onClick={clearTeamFilters}
              className="teams-clear-btn"
            >
              Limpiar
            </button>
          </div>

          <div className="teams-grid">
            {paginatedTeams.map((team) => {
              const teamRecord = getTeamRecord(team)

              const isMain =
                team.is_main === true ||
                team.is_main === 'true'

              return (
                <div
                  key={team.id}
                  className={
                    isMain
                      ? 'team-card main-team-card'
                      : 'team-card'
                  }
                >
                  <div className="team-card-header">
                    <img
                      src={team.logo_url || 'https://placehold.co/100x100'}
                      alt={team.name}
                      className="team-logo"
                    />

                    <div>
                      <h3 className="team-name">
                        {team.name}
                      </h3>

                      <p className="team-city">
                        {team.city || 'Sin ciudad'}
                      </p>
                    </div>
                  </div>

                  <div className="team-record">
                    <div className="record-box win-box">
                      <span>W</span>
                      <strong>{teamRecord.wins}</strong>
                    </div>

                    <div className="record-box loss-box">
                      <span>L</span>
                      <strong>{teamRecord.losses}</strong>
                    </div>
                  </div>

                  {isMain && (
                    <span className="team-main-badge">
                      Principal
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {paginatedTeams.length === 0 && (
            <div className="empty-results">
              No se encontraron equipos.
            </div>
          )}

          <div className="teams-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default TeamsPage