import { NavLink, useNavigate } from 'react-router-dom'

import {
  BarChart3,
  Building2,
  CreditCard,
  DollarSign,
  LogOut,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'

import './SuperAdminLayout.css'

function SuperAdminLayout({ children }) {
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  const navClass = ({ isActive }) =>
    isActive
      ? 'superadmin-nav-link active'
      : 'superadmin-nav-link'

  return (
    <div className="superadmin-layout">
      <aside className="superadmin-sidebar">

        <div className="superadmin-brand">
          <div className="superadmin-brand-icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h2>DiamondStats</h2>

            <span>
              Superadmin
            </span>
          </div>
        </div>

        <nav className="superadmin-nav">

          <NavLink
            to="/superadmin"
            end
            className={navClass}
          >
            <BarChart3 size={20} />

            Dashboard
          </NavLink>

          <NavLink
            to="/superadmin/tenants"
            className={navClass}
          >
            <Building2 size={20} />

            Tenants
          </NavLink>

          <NavLink
            to="/superadmin/create-tenant"
            className={navClass}
          >
            <PlusCircle size={20} />

            Crear tenant
          </NavLink>

          <div className="superadmin-nav-divider"></div>

          <div className="superadmin-nav-section">
            Billing
          </div>

          <NavLink
            to="/superadmin/billing"
            className={navClass}
          >
            <DollarSign size={20} />

            Pagos
          </NavLink>

          <NavLink
            to="/superadmin/plans"
            className={navClass}
          >
            <CreditCard size={20} />

            Planes
          </NavLink>

        </nav>

        <div className="superadmin-user-box">

          <p>
            {user?.username || 'Super Admin'}
          </p>

          <span>
            {user?.email}
          </span>

          <button
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            Cerrar sesión
          </button>

        </div>
      </aside>

      <main className="superadmin-main">
        {children}
      </main>
    </div>
  )
}

export default SuperAdminLayout