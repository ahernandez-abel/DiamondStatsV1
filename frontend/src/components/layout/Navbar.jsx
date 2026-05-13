import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import logo from '../../assets/logo.png'

import './Navbar.css'

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">

      <div className="navbar-left">

        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >

          <img
            src={logo}
            alt="DiamondStats Logo"
            className="navbar-logo-image"
          />

          <div className="navbar-brand-text">

            <span className="navbar-logo">
              DiamondStats
            </span>

            <span className="navbar-badge">
              Softball Analytics
            </span>

          </div>

        </Link>

      </div>

      <button
        type="button"
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={menuOpen ? 'navbar-links open' : 'navbar-links'}>

        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Inicio
        </NavLink>

        <NavLink to="/players" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Jugadores
        </NavLink>

        <NavLink to="/teams" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Equipos
        </NavLink>

        <NavLink to="/games" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Juegos
        </NavLink>

        <NavLink to="/stats/batting" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Bateo
        </NavLink>

        <NavLink to="/stats/pitching" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Pitcher
        </NavLink>

        <NavLink to="/stats/fielding" onClick={closeMenu} className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
          Defensa
        </NavLink>

        <Link
          to="/login"
          onClick={closeMenu}
          className="navbar-login-btn mobile-login"
        >
          Iniciar Sesión
        </Link>

      </nav>

      <div className="navbar-login-desktop">

        <Link
          to="/login"
          className="navbar-login-btn"
        >
          Iniciar Sesión
        </Link>

      </div>

    </header>
  )
}

export default Navbar