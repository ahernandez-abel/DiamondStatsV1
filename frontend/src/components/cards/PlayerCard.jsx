// src/components/cards/PlayerCard.jsx

import './PlayerCard.css'

function PlayerCard({ player }) {

  return (
    <div className="player-card">

      <div className="player-card-glow"></div>

      <div className="player-card-content">

        <div className="player-image-container">

          <img
            src={
              player.photo_url ||
              'https://placehold.co/200x200'
            }
            alt={player.full_name}
            className="player-image"
          />

          <div className="player-number">
            #{player.jersey_number || '00'}
          </div>

        </div>

        <div className="player-info">

          <div className="player-main-line">

  <h2 className="player-name">
    {player.full_name}
  </h2>

  <p className="player-position">
    {player.position || 'Sin Posición'}
  </p>

</div>

          <div className="player-meta">

            <span className="player-tag">
              Softball
            </span>

            <span className="player-tag secondary">
              Activo
            </span>

          </div>

        </div>

      </div>

    </div>
  )
}

export default PlayerCard