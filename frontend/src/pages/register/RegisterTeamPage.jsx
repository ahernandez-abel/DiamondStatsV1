import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

import api from '../../api/axios'
import logo from '../../assets/logo.png'

import './RegisterTeamPage.css'

function RegisterTeamPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdData, setCreatedData] = useState(null)

  const [form, setForm] = useState({
    tenant_name: '',
    team_name: '',
    contact_email: '',
    whatsapp: '',
    city: '',
    manager_name: '',
    admin_username: '',
    admin_email: '',
    admin_password: '',
    plan: 'free',
    is_public: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const selectPlan = (plan) => {
    setForm((prev) => ({
      ...prev,
      plan,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setCreatedData(null)
    setLoading(true)

    try {
      const payload = {
        ...form,
        team_name: form.team_name || form.tenant_name,
        contact_email: form.contact_email || form.admin_email,
      }

      const res = await api.post('/tenants/onboarding', payload)

      setCreatedData(res.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo registrar el equipo. Inténtalo nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.log(error)
    }
  }

  const siteUrl = window.location.origin

  if (createdData) {
    const publicUrl = `${siteUrl}${createdData.public_url}`

    return (
      <main className="register-page">
        <section className="register-success-card">

          <div className="register-success-logo">
            <img src={logo} alt="DiamondStats" />
          </div>

          <div className="register-success-icon">
            <CheckCircle2 size={42} />
          </div>

          <h1>Equipo registrado correctamente</h1>

          <p>
            Tu equipo fue creado en DiamondStats. Guarda este código y comparte
            el enlace con jugadores o seguidores.
          </p>

          <div className="register-result-box">
            <span>Código privado de acceso</span>

            <div>
              <strong>{createdData.access_code}</strong>

              <button
                type="button"
                onClick={() => copyText(createdData.access_code)}
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="register-result-box">
            <span>Enlace del equipo</span>

            <div>
              <strong>{publicUrl}</strong>

              <button
                type="button"
                onClick={() => copyText(publicUrl)}
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="register-success-actions">
            <Link
              to="/login"
              className="register-primary-btn"
            >
              Ir al login
            </Link>

            <Link
              to="/"
              className="register-secondary-btn"
            >
              Volver al inicio
            </Link>
          </div>

        </section>
      </main>
    )
  }

  return (
    <main className="register-page">
      <section className="register-wrapper">

        <div className="register-info">

          <Link
            to="/"
            className="register-back-link"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <div className="register-brand">

            <div className="register-logo">
              <img src={logo} alt="DiamondStats" />
            </div>

            <div>
              <h2>DiamondStats</h2>
              <span>Registro de equipo</span>
            </div>

          </div>

          <h1>
            Registra tu equipo y empieza a controlar tus estadísticas.
          </h1>

          <p>
            Crea el espacio privado de tu equipo, registra tu administrador y
            comienza a organizar jugadores, juegos y estadísticas desde un solo lugar.
          </p>

          <div className="register-info-card">

            <ShieldCheck size={28} />

            <div>

              <h3>
                ¿Qué se crea automáticamente?
              </h3>

              <ul>
                <li>Cuenta del equipo</li>
                <li>Equipo principal</li>
                <li>Usuario administrador</li>
                <li>Código privado de acceso</li>
              </ul>

            </div>

          </div>

        </div>

        <form
          className="register-form-card"
          onSubmit={handleSubmit}
        >

          <div className="register-form-header">
            <span>Paso 1</span>
            <h2>Elige el plan de tu equipo</h2>
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <div className="register-plans-grid">

            <button
              type="button"
              className={`register-plan-card ${
                form.plan === 'free' ? 'active' : ''
              }`}
              onClick={() => selectPlan('free')}
            >
              <span className="register-plan-badge">
                Para comenzar
              </span>

              <h3>Free</h3>

              <p className="register-plan-price">
                Gratis
              </p>

              <ul>
                <li>Registro del equipo</li>
                <li>Jugadores limitados</li>
                <li>Juegos limitados</li>
                <li>Estadísticas básicas</li>
                <li>Acceso privado con código</li>
              </ul>
            </button>

            <button
              type="button"
              className={`register-plan-card featured ${
                form.plan === 'pro' ? 'active' : ''
              }`}
              onClick={() => selectPlan('pro')}
            >
              <span className="register-plan-badge">
                Recomendado
              </span>

              <h3>Pro</h3>

              <p className="register-plan-price">
                Para equipos que quieren más control
              </p>

              <ul>
                <li>Más jugadores disponibles</li>
                <li>Más juegos registrados</li>
                <li>Estadísticas avanzadas</li>
                <li>Ranking, líderes y comparaciones</li>
                <li>Vista pública del equipo</li>
              </ul>
            </button>

          </div>

          <div className="register-selected-plan">
            Plan seleccionado: <strong>{form.plan === 'free' ? 'Free' : 'Pro'}</strong>
          </div>

          <div className="register-form-header second">
            <span>Paso 2</span>
            <h2>Datos del equipo</h2>
          </div>

          <div className="register-grid">

            <div className="register-field">
              <label>Nombre del equipo *</label>

              <input
                name="tenant_name"
                value={form.tenant_name}
                onChange={handleChange}
                placeholder="Ej: Mahanaim"
                required
              />
            </div>

            <div className="register-field">
              <label>Nombre visible del equipo</label>

              <input
                name="team_name"
                value={form.team_name}
                onChange={handleChange}
                placeholder="Ej: Mahanaim Softball"
              />
            </div>

            <div className="register-field">
              <label>Ciudad</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ej: Santo Domingo"
              />
            </div>

            <div className="register-field">
              <label>Manager / encargado</label>

              <input
                name="manager_name"
                value={form.manager_name}
                onChange={handleChange}
                placeholder="Nombre del encargado"
              />
            </div>

            <div className="register-field">
              <label>WhatsApp</label>

              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="8090000000"
              />
            </div>

            <div className="register-field">
              <label>Email de contacto</label>

              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="contacto@equipo.com"
              />
            </div>

            <label className="register-check">

              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={handleChange}
              />

              <span>
                Hacer estadísticas públicas sin código
              </span>

            </label>

          </div>

          <div className="register-form-header second">
            <span>Paso 3</span>
            <h2>Usuario administrador</h2>
          </div>

          <div className="register-grid">

            <div className="register-field">
              <label>Usuario *</label>

              <input
                name="admin_username"
                value={form.admin_username}
                onChange={handleChange}
                placeholder="Ej: adminmahanaim"
                required
              />
            </div>

            <div className="register-field">
              <label>Email *</label>

              <input
                type="email"
                name="admin_email"
                value={form.admin_email}
                onChange={handleChange}
                placeholder="admin@equipo.com"
                required
              />
            </div>

            <div className="register-field full">

              <label>Contraseña *</label>

              <div className="register-password-box">

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_password"
                  value={form.admin_password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>

              </div>

            </div>

          </div>

          <button
            className="register-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Registrando equipo...'
              : `Registrar equipo en plan ${form.plan === 'free' ? 'Free' : 'Pro'}`}
          </button>

        </form>

      </section>
    </main>
  )
}

export default RegisterTeamPage