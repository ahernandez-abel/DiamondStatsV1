import { useEffect, useState } from 'react'
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
import { getBillingPlans } from '../../api/billing.api'
import logo from '../../assets/logo.png'

import './RegisterTeamPage.css'

function RegisterTeamPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [error, setError] = useState('')
  const [createdData, setCreatedData] = useState(null)
  const [plans, setPlans] = useState([])

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
    plan: '',
    is_public: false,
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoadingPlans(true)

      const res = await getBillingPlans()

      const activePlans = (res.data.plans || []).filter(
        (plan) => plan.is_active && plan.is_public
      )

      setPlans(activePlans)

      if (activePlans.length > 0) {
        setForm((prev) => ({
          ...prev,
          plan: activePlans[0].slug,
        }))
      }
    } catch (error) {
      console.log(error)

      setPlans([
        {
          id: 1,
          name: 'Free',
          slug: 'free',
          description: 'Plan inicial para probar DiamondStats.',
          price_monthly: 0,
          currency: 'DOP',
          max_players: 15,
          max_games: 5,
          max_rival_teams: 5,
        },
        {
          id: 2,
          name: 'Pro',
          slug: 'pro',
          description: 'Plan para equipos que quieren más control.',
          price_monthly: 700,
          currency: 'DOP',
          max_players: null,
          max_games: null,
          max_rival_teams: null,
        },
      ])

      setForm((prev) => ({
        ...prev,
        plan: 'free',
      }))
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const selectPlan = (planSlug) => {
    setForm((prev) => ({
      ...prev,
      plan: planSlug,
    }))
  }

  const formatLimit = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Ilimitado'
    }

    return value
  }

  const formatPrice = (plan) => {
    const price = Number(plan.price_monthly || 0)

    if (price <= 0) {
      return 'Gratis'
    }

    return `${plan.currency || 'DOP'} ${price.toLocaleString('es-DO')} / mes`
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

  const selectedPlan = plans.find((plan) => plan.slug === form.plan)

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
              <h3>¿Qué se crea automáticamente?</h3>

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

          {loadingPlans ? (
            <div className="register-plans-loading">
              Cargando planes disponibles...
            </div>
          ) : (
            <div className="register-plans-grid">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`register-plan-card ${
                    form.plan === plan.slug ? 'active' : ''
                  }`}
                  onClick={() => selectPlan(plan.slug)}
                >
                  <span className="register-plan-badge">
                    {plan.slug === 'pro' ? 'Recomendado' : 'Disponible'}
                  </span>

                  <h3>{plan.name}</h3>

                  <p className="register-plan-price">
                    {formatPrice(plan)}
                  </p>

                  {plan.description && (
                    <p className="register-plan-description">
                      {plan.description}
                    </p>
                  )}

                  <ul>
                    <li>
                      Jugadores: {formatLimit(plan.max_players)}
                    </li>

                    <li>
                      Juegos: {formatLimit(plan.max_games)}
                    </li>

                    <li>
                      Equipos rivales: {formatLimit(plan.max_rival_teams)}
                    </li>

                    <li>
                      Acceso completo al sistema
                    </li>

                    <li>
                      Estadísticas, rankings y comparaciones
                    </li>
                  </ul>
                </button>
              ))}
            </div>
          )}

          {selectedPlan && (
            <div className="register-selected-plan">
              Plan seleccionado: <strong>{selectedPlan.name}</strong>
            </div>
          )}

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
            disabled={loading || !form.plan}
          >
            {loading
              ? 'Registrando equipo...'
              : `Registrar equipo${selectedPlan ? ` en plan ${selectedPlan.name}` : ''}`}
          </button>

        </form>

      </section>
    </main>
  )
}

export default RegisterTeamPage