import './TeamCard.css'

function TeamCard({ team }) {

  const wins = Number(team.wins || 0)
  const losses = Number(team.losses || 0)

  const totalGames = wins + losses

  const pct =
    totalGames === 0
      ? '.000'
      : (wins / totalGames)
          .toFixed(3)
          .replace('0', '')

  return (

    <div className="team-card">

      <div className="team-card-top">

        <div className="team-logo-wrapper">

          <img
            src={
              team.logo_url ||
              'https://placehold.co/100x100'
            }
            alt={team.name}
            className="team-card-logo"
          />

        </div>

        <div className="team-card-info">

          <h2 className="team-card-name">
            {team.name}
          </h2>

          <p className="team-card-city">
            {team.city || 'Sin ciudad'}
          </p>

        </div>

      </div>

      <div className="team-record-section">

        <div className="record-box wins-box">

          <span>
            Victorias
          </span>

          <strong>
            {wins}
          </strong>

        </div>

        <div className="record-box losses-box">

          <span>
            Derrotas
          </span>

          <strong>
            {losses}
          </strong>

        </div>

        <div className="record-box pct-box">

          <span>
            PCT
          </span>

          <strong>
            {pct}
          </strong>

        </div>

      </div>

      <div className="team-footer">

        <div className="team-status">
          Equipo Activo
        </div>

        <div className="team-games-count">
          {totalGames} Juegos
        </div>

      </div>

      <div className="team-card-glow"></div>

    </div>
  )
}

export default TeamCard