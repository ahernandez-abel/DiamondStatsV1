import { useState } from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  LockKeyhole,
  LogIn,
} from 'lucide-react'

import api from '../../api/axios'

import logo from '../../assets/logo.png'

import './TeamAccessPage.css'

function TeamAccessPage() {

  const navigate = useNavigate()

  const [code, setCode] = useState('')

  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {

    e.preventDefault()

    const cleanCode = code.trim()

    if (!cleanCode) {

      setError('Debes escribir el código del equipo.')

      return
    }

    try {

      setError('')

      setLoading(true)

      const res = await api.get(
        `/public/team-access/${cleanCode}`
      )

      const tenantSlug = res.data?.tenant?.slug

      const redirectUrl = res.data?.redirect_url

      if (!tenantSlug || !redirectUrl) {

        setError(
          'No se pudo obtener el acceso del equipo.'
        )

        return
      }

      localStorage.setItem(
        `tenant_access_${tenantSlug}`,
        cleanCode
      )

      navigate(
        redirectUrl,
        { replace: true }
      )

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Código inválido. Verifica e intenta nuevamente.'
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <main className="team-access-page">

      <section className="team-access-card">

        <Link
          to="/"
          className="team-access-back"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>

        <div className="team-access-logo">

          <img
            src={logo}
            alt="DiamondStats"
          />

        </div>

        <span className="team-access-badge">
          Acceso privado
        </span>

        <h1>
          Entrar al espacio del equipo
        </h1>

        <p>
          Escribe el código privado que compartió
          el administrador de tu equipo.
        </p>

        {error && (
          <div className="team-access-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="team-access-form"
        >

          <div className="team-access-input-box">

            <LockKeyhole size={20} />

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="Ej: ABC123"
              autoFocus
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            <LogIn size={19} />

            {
              loading
                ? 'Validando...'
                : 'Entrar al equipo'
            }

          </button>

        </form>

        <small>
          Si no tienes el código, solicítalo al encargado del equipo.
        </small>

      </section>

    </main>
  )
}

export default TeamAccessPage