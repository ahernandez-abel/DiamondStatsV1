import { useEffect, useState } from 'react'

import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

import SuperAdminLayout from '../../layouts/SuperAdminLayout'

import {
  getBillingTenants,
} from '../../api/billing.api'

import './BillingPage.css'

function BillingPage() {
  const [tenants, setTenants] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const res = await getBillingTenants()

      setTenants(res.data.tenants || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
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
              Controla pagos manuales, renovaciones y planes de los tenants.
            </p>

          </div>

        </div>

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
                        Plan
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
                          ? new Date(
                              tenant.last_payment_at
                            ).toLocaleDateString()
                          : 'Sin pagos'}
                      </span>
                    </div>

                    <div className="billing-row">
                      <strong>
                        Vence
                      </strong>

                      <span
                        className={
                          expired
                            ? 'expired-text'
                            : ''
                        }
                      >
                        {tenant.expires_at
                          ? new Date(
                              tenant.expires_at
                            ).toLocaleDateString()
                          : 'Sin vencimiento'}
                      </span>
                    </div>

                  </div>

                  <div className="billing-footer">

                    <div className="billing-total">
                      RD$
                      {' '}
                      {tenant.total_paid || 0}
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