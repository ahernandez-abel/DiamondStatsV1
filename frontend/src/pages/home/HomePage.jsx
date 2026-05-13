import { useEffect, useState } from 'react'

import PublicLayout from '../../layouts/PublicLayout'

import {
  getBattingLeaders,
  getPitchingLeaders,
  getFieldingLeaders,
  getMonthlyMVP,
} from '../../api/leaders.api'

import './HomePage.css'

function HomePage() {

  const [batting, setBatting] = useState([])
  const [pitching, setPitching] = useState([])
  const [fielding, setFielding] = useState([])
  const [mvp, setMvp] = useState(null)

  useEffect(() => {
    loadHomeStats()
  }, [])

  const loadHomeStats = async () => {
    try {
      const battingRes = await getBattingLeaders()
      const pitchingRes = await getPitchingLeaders()
      const fieldingRes = await getFieldingLeaders()
      const mvpRes = await getMonthlyMVP()

      setBatting(battingRes.data.leaders || [])
      setPitching(pitchingRes.data.leaders || [])
      setFielding(fieldingRes.data.leaders || [])
      setMvp(mvpRes.data.mvp || null)

    } catch (error) {
      console.log(error)
    }
  }

  const getTop = (list, field) => {
    return [...list]
      .sort((a, b) => Number(b[field] || 0) - Number(a[field] || 0))
      .slice(0, 5)
  }

  const LeaderRow = ({ rank, player, stat }) => (
    <div className="leader-row">

      <span className="leader-rank">
        {rank}
      </span>

      <img
        src={player?.photo_url || 'https://placehold.co/60x60'}
        alt={player?.full_name || 'Jugador'}
        className="leader-photo"
      />

      <span className="leader-name">
        {player?.full_name || '-'}
      </span>

      <span className="leader-stat">
        {stat ?? '-'}
      </span>

    </div>
  )

  const LeaderCard = ({ title, label, players, field, link }) => (
    <div className="leader-card">

      <div className="leader-card-header">
        <h2>{title}</h2>
        <span>{label}</span>
      </div>

      {players.length === 0 ? (
        <div className="leader-empty">
          Sin estadísticas todavía
        </div>
      ) : (
        players.map((player, index) => (
          <LeaderRow
            key={player.id}
            rank={index + 1}
            player={player}
            stat={player[field]}
          />
        ))
      )}

      <a
        href={link}
        className="leader-link"
      >
        Lista Completa
      </a>

    </div>
  )

  return (
    <PublicLayout>

      <section className="home-page">

        <div className="home-top-grid">

          <div className="home-hero-info">

            <span className="home-badge">
              🥎 Sistema Oficial del Equipo Mahanain
            </span>

            <h1 className="home-title">
              DiamondStats
            </h1>

            <p className="home-description">
              Estadísticas oficiales, líderes del equipo, MVP del mes,
              juegos y rendimiento acumulado de cada jugador.
            </p>

            <div className="home-buttons">

              <a
                href="/players"
                className="home-btn-primary"
              >
                Ver Jugadores
              </a>

              <a
                href="/games"
                className="home-btn-secondary"
              >
                Ver Juegos
              </a>

            </div>

          </div>

          <div className="mvp-card">

            <span className="mvp-label">
              MVP DEL MES
            </span>

            <img
              src={mvp?.photo_url || 'https://placehold.co/220x220?text=MVP'}
              alt={mvp?.full_name || 'MVP'}
              className="mvp-photo"
            />

            <h2>
              {mvp?.full_name || 'Sin MVP todavía'}
            </h2>

            <p>
              Calculado por puntos ofensivos del mes actual.
            </p>

            <div className="mvp-stats mvp-stats-four">

  <div>
    <span>PTS</span>
    <strong>{mvp?.mvp_points || 0}</strong>
  </div>

  <div>
    <span>AVG</span>
    <strong>{mvp?.avg || '.000'}</strong>
  </div>

  <div>
    <span>HR</span>
    <strong>{mvp?.hr || 0}</strong>
  </div>

  <div>
    <span>RBI</span>
    <strong>{mvp?.rbi || 0}</strong>
  </div>

</div>

          </div>

        </div>

        <div className="quick-leaders-grid">

          <div className="quick-stat-card">
            <span>AVG</span>
            <h3>{batting[0]?.avg || '.000'}</h3>
            <p>{batting[0]?.full_name || '-'}</p>
          </div>

          <div className="quick-stat-card">
            <span>HITS</span>
            <h3>{getTop(batting, 'h')[0]?.h || 0}</h3>
            <p>{getTop(batting, 'h')[0]?.full_name || '-'}</p>
          </div>

          <div className="quick-stat-card">
            <span>HR</span>
            <h3>{getTop(batting, 'hr')[0]?.hr || 0}</h3>
            <p>{getTop(batting, 'hr')[0]?.full_name || '-'}</p>
          </div>

          <div className="quick-stat-card">
            <span>RBI</span>
            <h3>{getTop(batting, 'rbi')[0]?.rbi || 0}</h3>
            <p>{getTop(batting, 'rbi')[0]?.full_name || '-'}</p>
          </div>

          <div className="quick-stat-card">
            <span>ERA</span>
            <h3>{pitching[0]?.era || '0.00'}</h3>
            <p>{pitching[0]?.full_name || '-'}</p>
          </div>

          <div className="quick-stat-card">
            <span>SO</span>
            <h3>{getTop(pitching, 'strikeouts')[0]?.strikeouts || 0}</h3>
            <p>{getTop(pitching, 'strikeouts')[0]?.full_name || '-'}</p>
          </div>

        </div>

        <div className="leaders-grid">

          <LeaderCard
            title="Promedio de Bateo"
            label="AVG"
            players={batting.slice(0, 5)}
            field="avg"
            link="/stats/batting"
          />

          <LeaderCard
            title="Hits"
            label="H"
            players={getTop(batting, 'h')}
            field="h"
            link="/stats/batting"
          />

          <LeaderCard
            title="Dobles"
            label="2B"
            players={getTop(batting, 'doubles')}
            field="doubles"
            link="/stats/batting"
          />

          <LeaderCard
            title="Triples"
            label="3B"
            players={getTop(batting, 'triples')}
            field="triples"
            link="/stats/batting"
          />

          <LeaderCard
            title="Cuadrangulares"
            label="HR"
            players={getTop(batting, 'hr')}
            field="hr"
            link="/stats/batting"
          />

          <LeaderCard
            title="Impulsadas"
            label="RBI"
            players={getTop(batting, 'rbi')}
            field="rbi"
            link="/stats/batting"
          />

          <LeaderCard
            title="Anotadas"
            label="R"
            players={getTop(batting, 'runs')}
            field="runs"
            link="/stats/batting"
          />

          <LeaderCard
            title="Bases Robadas"
            label="SB"
            players={getTop(batting, 'sb')}
            field="sb"
            link="/stats/batting"
          />

          <LeaderCard
            title="Efectividad"
            label="ERA"
            players={pitching.slice(0, 5)}
            field="era"
            link="/stats/pitching"
          />

          <LeaderCard
            title="Ponches"
            label="SO"
            players={getTop(pitching, 'strikeouts')}
            field="strikeouts"
            link="/stats/pitching"
          />

          <LeaderCard
            title="WHIP"
            label="WHIP"
            players={[...pitching]
              .sort((a, b) => Number(a.whip || 0) - Number(b.whip || 0))
              .slice(0, 5)}
            field="whip"
            link="/stats/pitching"
          />

          <LeaderCard
            title="Defensa"
            label="FLD%"
            players={fielding.slice(0, 5)}
            field="fielding_pct"
            link="/stats/fielding"
          />

        </div>

      </section>

    </PublicLayout>
  )
}

export default HomePage