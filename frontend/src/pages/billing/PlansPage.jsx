import { useEffect, useState } from 'react'

import {
  CheckCircle2,
  CreditCard,
  Save,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'

import {
  getBillingPlans,
  updateBillingPlan,
} from '../../api/billing.api'

import './PlansPage.css'

function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)

      const res = await getBillingPlans()

      setPlans(res.data.plans || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (planId, field, value) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              [field]: value,
            }
          : plan
      )
    )
  }

  const handleSave = async (plan) => {
    try {
      setSavingId(plan.id)
      setMessage('')

      const payload = {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price_monthly: Number(plan.price_monthly || 0),
        currency: plan.currency || 'DOP',

        max_players:
          plan.max_players === '' || plan.max_players === null
            ? null
            : Number(plan.max_players),

        max_games:
          plan.max_games === '' || plan.max_games === null
            ? null
            : Number(plan.max_games),

        max_rival_teams:
          plan.max_rival_teams === '' || plan.max_rival_teams === null
            ? null
            : Number(plan.max_rival_teams),

        allow_custom_logo: true,
        allow_advanced_stats: true,
        allow_player_compare: true,

        is_public: Boolean(plan.is_public),
        is_active: Boolean(plan.is_active),
      }

      await updateBillingPlan(plan.id, payload)

      setMessage('Plan actualizado correctamente')

      await loadPlans()
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'No se pudo actualizar el plan'
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <SuperAdminLayout>
      <section className="plans-page">
        <div className="plans-header">
          <span className="plans-badge">
            Planes comerciales
          </span>

          <h1>
            Planes y límites
          </h1>

          <p>
            Edita precios y límites de uso. Todos los planes tienen acceso completo al sistema.
          </p>
        </div>

        {message && (
          <div className="plans-message">
            {message}
          </div>
        )}

        {loading ? (
          <div className="plans-loading">
            Cargando planes...
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="plan-card"
              >
                <div className="plan-card-top">
                  <div className="plan-icon">
                    <CreditCard size={26} />
                  </div>

                  <div>
                    <h2>
                      {plan.name}
                    </h2>

                    <span>
                      {plan.slug}
                    </span>
                  </div>
                </div>

                <div className="plan-form-grid">
                  <div className="plan-group">
                    <label>Nombre</label>

                    <input
                      type="text"
                      value={plan.name || ''}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'name',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Slug</label>

                    <input
                      type="text"
                      value={plan.slug || ''}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'slug',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Precio mensual</label>

                    <input
                      type="number"
                      value={plan.price_monthly || 0}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'price_monthly',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Moneda</label>

                    <input
                      type="text"
                      value={plan.currency || 'DOP'}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'currency',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group full">
                    <label>Descripción</label>

                    <textarea
                      value={plan.description || ''}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'description',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Máx. jugadores</label>

                    <input
                      type="number"
                      value={plan.max_players ?? ''}
                      placeholder="Ilimitado"
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'max_players',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Máx. juegos</label>

                    <input
                      type="number"
                      value={plan.max_games ?? ''}
                      placeholder="Ilimitado"
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'max_games',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="plan-group">
                    <label>Máx. rivales</label>

                    <input
                      type="number"
                      value={plan.max_rival_teams ?? ''}
                      placeholder="Ilimitado"
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'max_rival_teams',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="plan-checks">
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(plan.is_public)}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'is_public',
                          e.target.checked
                        )
                      }
                    />
                    Visible en landing
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(plan.is_active)}
                      onChange={(e) =>
                        handleChange(
                          plan.id,
                          'is_active',
                          e.target.checked
                        )
                      }
                    />
                    Activo
                  </label>
                </div>

                <div className="plan-note">
                  <CheckCircle2 size={18} />
                  Este plan tiene acceso completo al sistema. Solo cambian los límites de uso.
                </div>

                <button
                  type="button"
                  className="plan-save-button"
                  onClick={() => handleSave(plan)}
                  disabled={savingId === plan.id}
                >
                  {savingId === plan.id ? (
                    <>
                      <Save size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default PlansPage