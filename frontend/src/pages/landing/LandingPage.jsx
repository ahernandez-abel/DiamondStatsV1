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
  Trophy,
  UserPlus,
  CalendarDays,
  LineChart,
  CheckCircle2,
  Layers,
  Star,
} from 'lucide-react'

import logo from '../../assets/logo.png'

import './LandingPage.css'

function LandingPage() {
  return (
    <main className="landing-page">

      <section className="landing-hero">

        <nav className="landing-nav">

          <Link to="/" className="landing-brand">
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

            <Link to="/team-access" className="landing-nav-link">
              Entrar con código
            </Link>

            <Link to="/login" className="landing-login-btn">
              <LogIn size={18} />
              Iniciar sesión
            </Link>

          </div>

        </nav>

        <div className="landing-hero-content">

          <div className="landing-hero-text">

            <span className="landing-badge">
              Plataforma SaaS para equipos de softball
            </span>

            <h1>
              Administra tu equipo, registra juegos y construye estadísticas reales.
            </h1>

            <p>
              DiamondStats ayuda a equipos de softball a organizar jugadores,
              controlar juegos, registrar estadísticas y consultar líderes desde
              una plataforma privada, moderna y fácil de usar.
            </p>

            <div className="landing-actions">

              <Link to="/register-team" className="landing-primary-btn">
                Registrar mi equipo
                <ArrowRight size={19} />
              </Link>

              <Link to="/team-access" className="landing-secondary-btn">
                Entrar con código
              </Link>

            </div>

          </div>

          <div className="landing-promo-card">

            <span className="landing-promo-badge">
              Flujo del sistema
            </span>

            <h3>
              Deja de llevar tu equipo de forma desordenada.
            </h3>

            <p className="landing-promo-text">
              Con DiamondStats puedes crear el espacio de tu equipo, agregar
              jugadores, guardar juegos y empezar a construir un historial
              deportivo organizado.
            </p>

            <div className="landing-steps">

              <div className="landing-step">
                <strong>01</strong>
                <div>
                  <h4>Crea tu equipo</h4>
                  <p>Registra el nombre del equipo y crea su espacio privado.</p>
                </div>
              </div>

              <div className="landing-step">
                <strong>02</strong>
                <div>
                  <h4>Agrega jugadores</h4>
                  <p>Organiza tu roster con la información principal.</p>
                </div>
              </div>

              <div className="landing-step">
                <strong>03</strong>
                <div>
                  <h4>Registra juegos</h4>
                  <p>Guarda partidos, rivales, fechas y resultados.</p>
                </div>
              </div>

              <div className="landing-step">
                <strong>04</strong>
                <div>
                  <h4>Consulta estadísticas</h4>
                  <p>Visualiza rendimiento, líderes y datos del equipo.</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="landing-section">

        <div className="landing-section-header">
          <span>Qué hace DiamondStats</span>
          <h2>Un sistema completo para manejar tu equipo.</h2>
          <p>
            Pensado para managers, coaches y equipos que quieren organizar su
            temporada sin depender de hojas sueltas, notas o cálculos manuales.
          </p>
        </div>

        <div className="landing-feature-grid">

          <article className="landing-feature-card">
            <Users size={34} />
            <h3>Gestión de jugadores</h3>
            <p>
              Crea y organiza el roster de tu equipo con datos importantes de cada jugador.
            </p>
          </article>

          <article className="landing-feature-card">
            <ClipboardList size={34} />
            <h3>Control de juegos</h3>
            <p>
              Registra partidos, rivales, fechas, resultados e historial de temporada.
            </p>
          </article>

          <article className="landing-feature-card">
            <BarChart3 size={34} />
            <h3>Estadísticas</h3>
            <p>
              Consulta números ofensivos, defensivos y rendimiento general.
            </p>
          </article>

          <article className="landing-feature-card">
            <TrendingUp size={34} />
            <h3>Líderes del equipo</h3>
            <p>
              Identifica jugadores destacados por promedio, hits, carreras y más.
            </p>
          </article>

          <article className="landing-feature-card">
            <LockKeyhole size={34} />
            <h3>Acceso privado</h3>
            <p>
              Cada equipo puede tener su propio acceso mediante código privado.
            </p>
          </article>

          <article className="landing-feature-card">
            <ShieldCheck size={34} />
            <h3>Datos separados</h3>
            <p>
              La información de cada equipo se mantiene separada y organizada.
            </p>
          </article>

        </div>

      </section>

      <section className="landing-section landing-how-section">

        <div className="landing-section-header">
          <span>Cómo funciona</span>
          <h2>Simple para empezar, potente para crecer.</h2>
        </div>

        <div className="landing-how-grid">

          <article className="landing-how-card">
            <UserPlus size={30} />
            <h3>1. Registra tu equipo</h3>
            <p>
              Crea el equipo y prepara el espacio donde se guardará toda su información.
            </p>
          </article>

          <article className="landing-how-card">
            <Users size={30} />
            <h3>2. Carga tu roster</h3>
            <p>
              Agrega jugadores y mantén la plantilla organizada durante la temporada.
            </p>
          </article>

          <article className="landing-how-card">
            <CalendarDays size={30} />
            <h3>3. Guarda juegos</h3>
            <p>
              Registra cada partido jugado para construir el historial del equipo.
            </p>
          </article>

          <article className="landing-how-card">
            <LineChart size={30} />
            <h3>4. Analiza resultados</h3>
            <p>
              Consulta estadísticas, líderes y rendimiento de tus jugadores.
            </p>
          </article>

        </div>

      </section>

      <section className="landing-section">

        <div className="landing-section-header">
          <span>Módulos principales</span>
          <h2>Todo conectado en una misma plataforma.</h2>
        </div>

        <div className="landing-modules-grid">

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Dashboard administrativo</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Jugadores</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Equipos</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Juegos</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Estadísticas</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Líderes</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Comparación de jugadores</span>
          </div>

          <div className="landing-module-item">
            <CheckCircle2 size={20} />
            <span>Acceso público o privado</span>
          </div>

        </div>

      </section>

      <section className="landing-section landing-benefits-section">

        <div className="landing-section-header">
          <span>Beneficios</span>
          <h2>Menos desorden, más control deportivo.</h2>
        </div>

        <div className="landing-benefits-grid">

          <article>
            <Trophy size={28} />
            <h3>Profesionaliza tu equipo</h3>
            <p>
              Presenta tus datos de forma más organizada y seria.
            </p>
          </article>

          <article>
            <Layers size={28} />
            <h3>Historial centralizado</h3>
            <p>
              Mantén jugadores, juegos y estadísticas en un solo lugar.
            </p>
          </article>

          <article>
            <Star size={28} />
            <h3>Mejores decisiones</h3>
            <p>
              Usa datos reales para comparar rendimiento y evolución.
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

        <Link to="/register-team" className="landing-primary-btn">
          Registrar mi equipo
          <ArrowRight size={18} />
        </Link>

      </section>

<footer className="landing-footer">

  <p>
    AbelDev
  </p>
  <p>
    Contacto: 809-447-2022
    </p>
  <span>
    © 2026 DiamondStats • Sistema desarrollado por AbelDev
  </span>

</footer>

</main>
  )
}

export default LandingPage