import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Save,
  UserPlus,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'
import { createTenantManual } from '../../api/superadmin.api'

import './CreateTenantPage.css'

function CreateTenantPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: 'free',
    is_public: true,
    access_code: '',
    logo_url: '',

    admin_username: '',
    admin_email: '',
    admin_password: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    const newValue = type === 'checkbox' ? checked : value

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === 'name'
        ? { slug: generateSlug(value) }
        : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        plan: form.plan,
        is_public: form.is_public,
        access_code: form.is_public
          ? null
          : form.access_code.trim(),
        logo_url: form.logo_url.trim() || null,

        admin_username: form.admin_username.trim(),
        admin_email: form.admin_email.trim(),
        admin_password: form.admin_password.trim(),
      }

      if (!payload.name || !payload.slug) {
        setError('El nombre y el slug son obligatorios')
        setLoading(false)
        return
      }

      if (!payload.is_public && !payload.access_code) {
        setError('Los tenants privados necesitan un código de acceso')
        setLoading(false)
        return
      }

      if (
        !payload.admin_username ||
        !payload.admin_email ||
        !payload.admin_password
      ) {
        setError('Debes completar los datos del admin del tenant')
        setLoading(false)
        return
      }

      await createTenantManual(payload)

      setSuccess('Tenant, equipo principal y admin creados correctamente')

      setTimeout(() => {
        navigate('/superadmin/tenants')
      }, 900)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No se pudo crear el tenant'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SuperAdminLayout>
      <section className="create-tenant-page">
        <div className="superadmin-page-header">
          <span className="superadmin-page-badge">
            Nuevo cliente
          </span>

          <h1>Crear tenant</h1>

          <p>
            Crea manualmente un cliente/equipo principal, su equipo inicial y el usuario admin dueño.
          </p>
        </div>

        <form
          className="create-tenant-card"
          onSubmit={handleSubmit}
        >
          <div className="create-tenant-section-title">
            <div className="create-tenant-icon">
              <Building2 size={30} />
            </div>

            <div>
              <h2>Datos del tenant</h2>
              <p>Información principal del cliente/equipo.</p>
            </div>
          </div>

          {error && (
            <div className="create-tenant-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="create-tenant-message success">
              {success}
            </div>
          )}

          <div className="create-tenant-grid">
            <div className="create-tenant-group">
              <label>Nombre del tenant</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Mahanaim"
                required
              />
            </div>

            <div className="create-tenant-group">
              <label>Slug público</label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="mahanaim"
                required
              />
            </div>

            <div className="create-tenant-group">
              <label>Plan</label>

              <select
  name="plan"
  value={form.plan}
  onChange={handleChange}
>
  <option value="free">
    Free
  </option>

  <option value="pro">
    Pro
  </option>
</select>
            </div>

            <div className="create-tenant-group">
              <label>Logo URL</label>

              <input
                type="text"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <label className="create-tenant-check">
            <input
              type="checkbox"
              name="is_public"
              checked={form.is_public}
              onChange={handleChange}
            />

            <span>
              Tenant público, visible sin código de acceso
            </span>
          </label>

          {!form.is_public && (
            <div className="create-tenant-group">
              <label>Código de acceso privado</label>

              <input
                type="text"
                name="access_code"
                value={form.access_code}
                onChange={handleChange}
                placeholder="Ej: MAHANAIM2026"
              />
            </div>
          )}

          <div className="create-tenant-divider"></div>

          <div className="create-tenant-section-title">
            <div className="create-tenant-icon admin">
              <UserPlus size={30} />
            </div>

            <div>
              <h2>Admin del tenant</h2>
              <p>Este usuario podrá entrar al panel privado del equipo.</p>
            </div>
          </div>

          <div className="create-tenant-grid">
            <div className="create-tenant-group">
              <label>Nombre del admin</label>

              <input
                type="text"
                name="admin_username"
                value={form.admin_username}
                onChange={handleChange}
                placeholder="Ej: Abel Hernandez"
                required
              />
            </div>

            <div className="create-tenant-group">
              <label>Email del admin</label>

              <input
                type="email"
                name="admin_email"
                value={form.admin_email}
                onChange={handleChange}
                placeholder="admin@equipo.com"
                required
              />
            </div>

            <div className="create-tenant-group">
              <label>Contraseña del admin</label>

              <input
                type="text"
                name="admin_password"
                value={form.admin_password}
                onChange={handleChange}
                placeholder="Ej: 123456"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="create-tenant-button"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Creando...' : 'Crear tenant y admin'}
          </button>
        </form>
      </section>
    </SuperAdminLayout>
  )
}

export default CreateTenantPage