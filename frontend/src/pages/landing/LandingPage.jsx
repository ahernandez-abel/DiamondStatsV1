// src/pages/landing/LandingPage.jsx

import { Link } from 'react-router-dom'

import {
  BarChart3,
  ShieldCheck,
  Users,
  ArrowRight,
  LogIn,
  ClipboardList,
  TrendingUp,
  LockKeyhole,
} from 'lucide-react'

import logo from '../../assets/logo.png'

import './LandingPage.css'

function LandingPage() {
  return (
    <main className="landing-page">

      <section className="landing-hero">

        <nav className="landing-nav">

          <Link
            to="/"
            className="landing-brand"
          >
            <img
              src={logo}
              alt="DiamondStats"
              className="landing-brand-logo"
            />

            <div>
              <h2>DiamondStats</h2>
              <span>Softball Team Management</span>
            </div>
          </Link>

          <div className="landing-nav-actions">

            <Link
              to="/team-access"
              className="landing-nav-link"
            >
              Entrar con código
            </Link>

            <Link
              to="/login"
              className="landing-login-btn"
            >
              <LogIn size={18} />
              Iniciar sesión
            </Link>

          </div>

        </nav>

        <div className="landing-hero-content">

          <div className="landing-hero-text">

            <span className="landing-badge">
              Plataforma para equipos de softball
            </span>

            <h1>
              Organiza tu equipo y construye su historial deportivo.
            </h1>

            <p>
              DiamondStats te permite registrar jugadores, juegos y estadísticas
              en una plataforma privada para tu equipo. Empieza desde cero y
              mantén toda la información deportiva organizada en un solo lugar.
            </p>

            <div className="landing-actions">

              <Link
                to="/register-team"
                className="landing-primary-btn"
              >
                Registrar mi equipo
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/team-access"
                className="landing-secondary-btn"
              >
                Entrar con código
              </Link>

            </div>

          </div>

          <div className="landing-promo-card">

            <img
              src={logo}
              alt="DiamondStats"
              className="landing-promo-logo"
            />

            <span className="landing-promo-badge">
              Cómo funciona
            </span>

            <h3>
              Crea tu equipo y empieza a organizarlo en minutos.
            </h3>

            <div className="landing-steps">

              <div className="landing-step">

                <strong>01</strong>

                <div>
                  <h4>Registra tu equipo</h4>

                  <p>
                    Crea el espacio privado de tu equipo dentro de DiamondStats.
                  </p>
                </div>

              </div>

              <div className="landing-step">

                <strong>02</strong>

                <div>
                  <h4>Agrega jugadores</h4>

                  <p>
                    Organiza tu roster con la información principal de cada jugador.
                  </p>
                </div>

              </div>

              <div className="landing-step">

                <strong>03</strong>

                <div>
                  <h4>Guarda tus juegos</h4>

                  <p>
                    Empieza a construir el historial deportivo de tu temporada.
                  </p>
                </div>

              </div>

            </div>

            <Link
              to="/register-team"
              className="landing-promo-btn"
            >
              Crear mi equipo
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

      <section className="landing-features">

        <div className="landing-section-header">

          <span>
            Qué puedes manejar
          </span>

          <h2>
            Todo lo necesario para administrar tu equipo.
          </h2>

        </div>

        <div className="landing-feature-grid">

          <article className="landing-feature-card">
            <Users size={34} />

            <h3>Jugadores</h3>

            <p>
              Guarda y organiza la información principal de cada jugador.
            </p>
          </article>

          <article className="landing-feature-card">
            <ClipboardList size={34} />

            <h3>Juegos</h3>

            <p>
              Registra partidos, resultados y rivales de cada temporada.
            </p>
          </article>

          <article className="landing-feature-card">
            <BarChart3 size={34} />

            <h3>Estadísticas</h3>

            <p>
              Consulta el rendimiento del equipo según los juegos registrados.
            </p>
          </article>

          <article className="landing-feature-card">
            <TrendingUp size={34} />

            <h3>Líderes</h3>

            <p>
              Visualiza los jugadores más destacados de la temporada.
            </p>
          </article>

          <article className="landing-feature-card">
            <LockKeyhole size={34} />

            <h3>Acceso privado</h3>

            <p>
              Comparte un código privado para entrar al espacio del equipo.
            </p>
          </article>

          <article className="landing-feature-card">
            <ShieldCheck size={34} />

            <h3>Datos separados</h3>

            <p>
              Cada equipo mantiene su propia información y estadísticas.
            </p>
          </article>

        </div>

      </section>

      <section className="landing-final-cta">

        <div>

          <span>DiamondStats</span>

          <h2>
            Empieza hoy a construir el historial de tu equipo.
          </h2>

          <p>
            Registra jugadores, juegos y estadísticas desde el primer partido.
          </p>

        </div>

        <Link
          to="/register-team"
          className="landing-primary-btn"
        >
          Registrar mi equipo
          <ArrowRight size={18} />
        </Link>

      </section>

    </main>
  )
}

export default LandingPage