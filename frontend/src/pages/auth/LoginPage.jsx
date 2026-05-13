import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'

import logo from '../../assets/logo.png'

import './LoginPage.css'

function LoginPage() {

  const navigate = useNavigate()

  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    const result = await login(form)

    if (!result.success) {
      setError(result.message)
      return
    }

    navigate('/players/create')
  }

  return (
    <div className="login-container">

      <div className="login-bg-ball"></div>
      <div className="login-bg-glow"></div>

      <form
        onSubmit={handleSubmit}
        className="login-card"
      >

        <div className="login-header">

          <img
            src={logo}
            alt="DiamondStats Logo"
            className="login-logo"
          />

          <span className="login-badge">
            Panel Administrativo
          </span>

          <h1 className="login-title">
            DiamondStats
          </h1>

          <p className="login-subtitle">
            Acceso privado para gestionar jugadores, juegos y estadísticas.
          </p>

        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <div className="login-form-group">

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />

        </div>

        <div className="login-form-group">

          <label>
            Contraseña
          </label>

          <div className="password-wrapper">

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

          </div>

        </div>

        <button
          type="submit"
          className="login-button"
        >
          Entrar al Sistema
        </button>

        <Link
  to="/"
  className="login-back-home"
>
  ← Volver al Inicio
</Link>

      </form>

    </div>
  )
}

export default LoginPage