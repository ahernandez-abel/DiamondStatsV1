import { useEffect, useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Save,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'

import {
  changeTenantPlan,
  getBillingPlans,
  getBillingTenants,
  registerManualPayment,
} from '../../api/billing.api'

import './BillingPage.css'

function BillingPage() {
  const [tenants, setTenants] = useState([])
  const [plans, setPlans] = useState([])

  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [message, setMessage] = useState('')

  const [forms, setForms] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const getNextMonthDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().slice(0, 10)
  }

  const buildForms = (tenantsData) => {
    const initialForms = {}

    tenantsData.forEach((tenant) => {
      initialForms[tenant.id] = {
        plan_id: tenant.plan_id || '',
        amount: tenant.price_monthly || '',
        payment_method: 'transferencia',
        period_end: tenant.expires_at
          ? tenant.expires_at.slice(0, 10)
          : getNextMonthDate(),
        reference: '',
        notes: '',
      }
    })

    setForms(initialForms)
  }

  const loadData = async () => {
    try {
      setLoading(true)

      const [tenantsRes, plansRes] = await Promise.all([
        getBillingTenants(),
        getBillingPlans(),
      ])

      const tenantsData = tenantsRes.data.tenants || []

      setTenants(tenantsData)
      setPlans(plansRes.data.plans || [])
      buildForms(tenantsData)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (tenantId, field, value) => {
    setForms((prev) => ({
      ...prev,
      [tenantId]: {
        ...prev[tenantId],
        [field]: value,
      },
    }))

    if (field === 'plan_id') {
      const selectedPlan = plans.find(
        (plan) => String(plan.id) === String(value)
      )

      if (selectedPlan) {
        setForms((prev) => ({
          ...prev,
          [tenantId]: {
            ...prev[tenantId],
            plan_id: value,
            amount: selectedPlan.price_monthly || 0,
          },
        }))
      }
    }
  }

  const handleChangePlanOnly = async (tenantId) => {
    try {
      const form = forms[tenantId]

      if (!form?.plan_id) {
        setMessage('Debes seleccionar un plan')
        return
      }

      setSavingId(tenantId)
      setMessage('')

      await changeTenantPlan(tenantId, {
        plan_id: form.plan_id,
        expires_at: form.period_end || null,
        status: 'active',
        notes: form.notes || 'Plan actualizado manualmente por superadmin',
      })

      setMessage('Plan actualizado correctamente')
      await loadData()
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'No se pudo cambiar el plan'
      )
    } finally {
      setSavingId(null)
    }
  }

  const handleRegisterPayment = async (tenantId) => {
    try {
      const form = forms[tenantId]

      if (!form?.plan_id) {
        setMessage('Debes seleccionar un plan')
        return
      }

      if (!form?.amount || Number(form.amount) <= 0) {
        setMessage('Debes colocar un monto válido')
        return
      }

      setSavingId(tenantId)
      setMessage('')

      const today = new Date().toISOString().slice(0, 10)

      await registerManualPayment(tenantId, {
        plan_id: form.plan_id,
        amount: Number(form.amount),
        currency: 'DOP',
        payment_method: form.payment_method,
        status: 'paid',
        paid_at: new Date().toISOString(),
        period_start: today,
        period_end: form.period_end || null,
        reference: form.reference,
        notes: form.notes,
        update_subscription: true,
      })

      setMessage('Pago registrado y plan actualizado correctamente')
      await loadData()
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'No se pudo registrar el pago'
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <SuperAdminLayout>
      <section className="billing-page">
        <div className="billing-header">
          <div>
            <span className="billing-badge">
              Billing manual
            </span>

            <h1>
              Pagos y Suscripciones
            </h1>

            <p>
              Controla pagos manuales, renovaciones y cambios de plan de los tenants.
            </p>
          </div>
        </div>

        {message && (
          <div className="billing-message">
            {message}
          </div>
        )}

        {loading ? (
          <div className="billing-loading">
            Cargando billing...
          </div>
        ) : (
          <div className="billing-grid">
            {tenants.map((tenant) => {
              const expired =
                tenant.expires_at &&
                new Date(tenant.expires_at) < new Date()

              const form = forms[tenant.id] || {}

              return (
                <div
                  key={tenant.id}
                  className="billing-card"
                >
                  <div className="billing-card-top">
                    <div className="billing-icon">
                      <DollarSign size={24} />
                    </div>

                    <div>
                      <h3>
                        {tenant.name}
                      </h3>

                      <span>
                        {tenant.slug}
                      </span>
                    </div>
                  </div>

                  <div className="billing-info">
                    <div className="billing-row">
                      <strong>
                        Plan actual
                      </strong>

                      <span>
                        {tenant.plan_name || tenant.legacy_plan || 'Free'}
                      </span>
                    </div>

                    <div className="billing-row">
                      <strong>
                        Estado
                      </strong>

                      <span
                        className={
                          tenant.subscription_status === 'active'
                            ? 'status-active'
                            : 'status-inactive'
                        }
                      >
                        {tenant.subscription_status || 'inactive'}
                      </span>
                    </div>

                    <div className="billing-row">
                      <strong>
                        Último pago
                      </strong>

                      <span>
                        {tenant.last_payment_at
                          ? new Date(tenant.last_payment_at).toLocaleDateString()
                          : 'Sin pagos'}
                      </span>
                    </div>

                    <div className="billing-row">
                      <strong>
                        Vence
                      </strong>

                      <span className={expired ? 'expired-text' : ''}>
                        {tenant.expires_at
                          ? new Date(tenant.expires_at).toLocaleDateString()
                          : 'Sin vencimiento'}
                      </span>
                    </div>
                  </div>

                  <div className="billing-admin-box">
                    <h4>
                      Gestión del plan
                    </h4>

                    <div className="billing-form-grid">
                      <label>
                        Plan
                        <select
                          value={form.plan_id || ''}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'plan_id',
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Seleccionar plan
                          </option>

                          {plans.map((plan) => (
                            <option
                              key={plan.id}
                              value={plan.id}
                            >
                              {plan.name} - RD$ {plan.price_monthly}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Monto pagado
                        <input
                          type="number"
                          value={form.amount || ''}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'amount',
                              e.target.value
                            )
                          }
                          placeholder="700"
                        />
                      </label>

                      <label>
                        Método
                        <select
                          value={form.payment_method || 'transferencia'}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'payment_method',
                              e.target.value
                            )
                          }
                        >
                          <option value="transferencia">
                            Transferencia
                          </option>
                          <option value="efectivo">
                            Efectivo
                          </option>
                          <option value="pago_movil">
                            Pago móvil
                          </option>
                          <option value="otro">
                            Otro
                          </option>
                        </select>
                      </label>

                      <label>
                        Vence
                        <input
                          type="date"
                          value={form.period_end || ''}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'period_end',
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <label className="billing-form-full">
                        Referencia
                        <input
                          type="text"
                          value={form.reference || ''}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'reference',
                              e.target.value
                            )
                          }
                          placeholder="No. comprobante, banco, nota..."
                        />
                      </label>

                      <label className="billing-form-full">
                        Nota
                        <textarea
                          value={form.notes || ''}
                          onChange={(e) =>
                            handleFormChange(
                              tenant.id,
                              'notes',
                              e.target.value
                            )
                          }
                          placeholder="Ej: Pago recibido por transferencia"
                        />
                      </label>
                    </div>

                    <div className="billing-actions">
                      <button
                        type="button"
                        className="billing-secondary-btn"
                        onClick={() => handleChangePlanOnly(tenant.id)}
                        disabled={savingId === tenant.id}
                      >
                        Cambiar solo plan
                      </button>

                      <button
                        type="button"
                        className="billing-primary-btn"
                        onClick={() => handleRegisterPayment(tenant.id)}
                        disabled={savingId === tenant.id}
                      >
                        <Save size={18} />
                        {savingId === tenant.id
                          ? 'Guardando...'
                          : 'Registrar pago'}
                      </button>
                    </div>
                  </div>

                  <div className="billing-footer">
                    <div className="billing-total">
                      RD$ {tenant.total_paid || 0}
                    </div>

                    {expired ? (
                      <div className="billing-warning">
                        <AlertTriangle size={16} />
                        Vencido
                      </div>
                    ) : (
                      <div className="billing-ok">
                        <CheckCircle2 size={16} />
                        Activo
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </SuperAdminLayout>
  )
}

export default BillingPage