import { Link } from 'react-router-dom'
import {
  BarChart3,
  ShieldCheck,
  Users,
  Trophy,
  LockKeyhole,
  ArrowRight,
  LogIn,
} from 'lucide-react'

import './LandingPage.css'

function LandingPage() {
  return (
    <main className="landing-page">

      <section className="landing-hero">

        <nav className="landing-nav">
          <div className="landing-brand">
            <div className="landing-logo">
              <Trophy size={24} />
            </div>

            <div>
              <h2>DiamondStats</h2>
              <span>Softball & Baseball Analytics</span>
            </div>
          </div>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login-btn">
              <LogIn size={18} />
              Iniciar sesión
            </Link>
          </div>
        </nav>

        <div className="landing-hero-content">

          <div className="landing-hero-text">
            <span className="landing-badge">
              Estadísticas modernas para equipos reales
            </span>

            <h1>
              Controla tu equipo, tus juegos y tus estadísticas en un solo lugar.
            </h1>

            <p>
              DiamondStats es una plataforma diseñada para equipos de softball y baseball.
              Administra jugadores, partidos, bateo, pitcheo, fildeo, líderes y comparaciones
              de forma privada por equipo.
            </p>

            <div className="landing-actions">
              <Link to="/register-team" className="landing-primary-btn">
                Registrar mi equipo
                <ArrowRight size={19} />
              </Link>

              <Link to="/login" className="landing-secondary-btn">
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="landing-access-card">
  <div className="landing-access-icon">
    <LockKeyhole size={28} />
  </div>

  <h3>Entrar con código de equipo</h3>

  <p>
    Si tu equipo ya está registrado, usa el código privado compartido
    por el administrador para acceder a las estadísticas.
  </p>

  <Link
    to="/team-access"
    className="landing-code-link"
  >
    Entrar con código
  </Link>

  <small>
    Acceso privado para jugadores y seguidores del equipo.
  </small>
</div>

        </div>

      </section>

      <section className="landing-features">

        <div className="landing-section-header">
          <span>¿Qué puedes hacer?</span>
          <h2>Todo el control deportivo de tu equipo</h2>
        </div>

        <div className="landing-feature-grid">

          <article className="landing-feature-card">
            <Users size={34} />
            <h3>Jugadores</h3>
            <p>
              Registra jugadores, posiciones, fotos y datos generales de cada integrante.
            </p>
          </article>

          <article className="landing-feature-card">
            <BarChart3 size={34} />
            <h3>Estadísticas</h3>
            <p>
              Controla bateo, pitcheo, fildeo, líderes y rendimiento por temporada.
            </p>
          </article>

          <article className="landing-feature-card">
            <ShieldCheck size={34} />
            <h3>Privacidad por equipo</h3>
            <p>
              Cada equipo tiene su propio acceso, sus datos y su panel administrativo.
            </p>
          </article>

        </div>

      </section>

      <section className="landing-plans">

        <div className="landing-section-header">
          <span>Planes</span>
          <h2>Empieza simple y crece cuando lo necesites</h2>
        </div>

        <div className="landing-plan-grid">

          <article className="landing-plan-card">
            <h3>Básico</h3>
            <p>Para equipos pequeños que quieren iniciar.</p>
            <ul>
              <li>Jugadores</li>
              <li>Juegos</li>
              <li>Estadísticas básicas</li>
            </ul>
          </article>

          <article className="landing-plan-card featured">
            <h3>Pro</h3>
            <p>Para equipos que quieren análisis completo.</p>
            <ul>
              <li>Todo lo del Básico</li>
              <li>Líderes</li>
              <li>Comparaciones</li>
              <li>Acceso privado</li>
            </ul>
          </article>

          <article className="landing-plan-card">
            <h3>Premium</h3>
            <p>Para ligas o proyectos más grandes.</p>
            <ul>
              <li>Multi-equipo</li>
              <li>Reportes avanzados</li>
              <li>Soporte prioritario</li>
            </ul>
          </article>

        </div>

      </section>

    </main>
  )
}

export default LandingPage