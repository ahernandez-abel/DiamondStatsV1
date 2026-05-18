import { useState } from 'react'

import {
  NavLink,
  useNavigate,
} from 'react-router-dom'

import {
  Menu,
  X,
  Users,
  UserPlus,
  Shield,
  CalendarDays,
  Trophy,
  Target,
  Activity,
  LogOut,
  Swords,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'

import logo from '../../assets/logo.png'

import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const closeSidebar = () => {
    setMobileOpen(false)
  }

  const sections = [
    {
      title: 'Panel',
      links: [
        {
          path: '/admin/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Juegos',
      links: [
        {
          path: '/admin/games/create',
          label: 'Crear Juego',
          icon: CalendarDays,
        },
        {
          path: '/admin/games',
          label: 'Partidos / Stats',
          icon: Trophy,
        },
      ],
    },
    {
      title: 'Jugadores',
      links: [
        {
          path: '/admin/players',
          label: 'Administrar Jugadores',
          icon: Users,
        },
        {
          path: '/admin/players/create',
          label: 'Crear Jugador',
          icon: UserPlus,
        },
        {
          path: '/admin/comparar',
          label: 'Comparar Jugadores',
          icon: Swords,
        },
      ],
    },
    {
      title: 'Equipos',
      links: [
        {
          path: '/admin/teams',
          label: 'Administrar Equipos',
          icon: Shield,
        },
        {
          path: '/admin/teams/create',
          label: 'Crear Equipo',
          icon: Shield,
        },
      ],
    },
    {
      title: 'Estadísticas',
      links: [
        {
          path: '/admin/stats/batting',
          label: 'Ver Bateo',
          icon: Target,
        },
        {
          path: '/admin/stats/pitching',
          label: 'Ver Pitcher',
          icon: Activity,
        },
      ],
    },
    {
      title: 'Cuenta',
      links: [
        {
          path: '/admin/billing',
          label: 'Mi Plan',
          icon: CreditCard,
        },
      ],
    },
  ]

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={28} />
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
        <div className="sidebar-top">
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
          >
            <X size={26} />
          </button>

          <img
            src={logo}
            alt="DiamondStats"
            className="sidebar-logo-image"
          />

          <h2 className="sidebar-logo">
            DS Admin
          </h2>

          <p className="sidebar-subtitle">
            Panel Administrativo
          </p>
        </div>

        <nav className="sidebar-menu">
          {sections.map((section) => (
            <div
              key={section.title}
              className="sidebar-section"
            >
              <span className="sidebar-section-title">
                {section.title}
              </span>

              {section.links.map((link) => {
                const Icon = link.icon

                return (
                  <NavLink
  key={link.path}
  to={link.path}
  end
  onClick={closeSidebar}
  className={({ isActive }) =>
    isActive
      ? 'sidebar-link active'
      : 'sidebar-link'
  }
>
                    <Icon
                      size={20}
                      className="sidebar-icon"
                    />

                    <span>
                      {link.label}
                    </span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="abeldev-badge">
            <span className="abeldev-title">
              AbelDev
            </span>

            <span className="abeldev-subtitle">
              DiamondStats System
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <LogOut size={18} />

            <span>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar