import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import logo from '../../assets/logo.png';

import './Navbar.css';

function Navbar({ tenantSlug }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const basePath = tenantSlug
    ? `/team/${tenantSlug}`
    : '';

  const homePath = tenantSlug
    ? `/team/${tenantSlug}`
    : '/';

  const navClass = ({ isActive }) =>
    isActive ? 'navbar-link active' : 'navbar-link';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link
          to={homePath}
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
        <NavLink to={homePath} onClick={closeMenu} className={navClass}>
          Inicio
        </NavLink>

        <NavLink to={`${basePath}/players`} onClick={closeMenu} className={navClass}>
          Jugadores
        </NavLink>

        <NavLink to={`${basePath}/comparar`} onClick={closeMenu} className={navClass}>
          Comparar
        </NavLink>

        <NavLink to={`${basePath}/teams`} onClick={closeMenu} className={navClass}>
          Equipos
        </NavLink>

        <NavLink to={`${basePath}/games`} onClick={closeMenu} className={navClass}>
          Juegos
        </NavLink>

        <NavLink to={`${basePath}/stats/batting`} onClick={closeMenu} className={navClass}>
          Bateo
        </NavLink>

        <NavLink to={`${basePath}/stats/pitching`} onClick={closeMenu} className={navClass}>
          Pitcher
        </NavLink>

        <NavLink to={`${basePath}/stats/fielding`} onClick={closeMenu} className={navClass}>
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
  );
}

export default Navbar;