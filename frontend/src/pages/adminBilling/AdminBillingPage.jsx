import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  MessageCircle,
} from 'lucide-react'

import DashboardLayout from '../../layouts/DashboardLayout'
import { getMyBilling } from '../../api/adminBilling.api'

import './AdminBillingPage.css'

function AdminBillingPage() {
  const [billing, setBilling] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBilling()
  }, [])

  const loadBilling = async () => {
    try {
      const res = await getMyBilling()

      setBilling(res.data.billing)
      setPaymentInfo(res.data.paymentInfo)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const whatsappNumber = paymentInfo?.whatsapp || ''

  const whatsappText = encodeURIComponent(
    `Hola, quiero actualizar mi equipo ${billing?.tenant_name || ''} al plan Pro de DiamondStats.`
  )

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappText}`
    : '#'

  if (loading) {
    return (
      <DashboardLayout>
        <div className="admin-billing-loading">
          Cargando plan...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <section className="admin-billing-page">
        <div className="admin-billing-header">
          <span>Mi Plan</span>

          <h1>
            Plan y facturación
          </h1>

          <p>
            Revisa el plan actual de tu equipo, sus límites y solicita actualización cuando lo necesites.
          </p>
        </div>

        <div className="admin-billing-card">
          <div className="admin-billing-card-top">
            <div className="admin-billing-icon">
              <CreditCard size={30} />
            </div>

            <div>
              <h2>
                {billing?.plan_name || 'Free'}
              </h2>

              <p>
                Equipo: {billing?.tenant_name}
              </p>
            </div>
          </div>

          <div className="admin-billing-price">
            RD$ {billing?.price_monthly || 0}
            <span>/ mes</span>
          </div>

          <div className="admin-billing-usage">
            <div>
              <strong>Jugadores</strong>

              <span>
                {billing?.total_players || 0} / {billing?.max_players || 'Ilimitado'}
              </span>
            </div>

            <div>
              <strong>Juegos</strong>

              <span>
                {billing?.total_games || 0} / {billing?.max_games || 'Ilimitado'}
              </span>
            </div>

            <div>
              <strong>Equipos rivales</strong>

              <span>
                {billing?.total_rival_teams || 0} / {billing?.max_rival_teams || 'Ilimitado'}
              </span>
            </div>
          </div>

          <div className="admin-billing-features">
            <p>
              <CheckCircle2 size={18} />
              Acceso completo al sistema
            </p>

            <p>
              <CheckCircle2 size={18} />
              Estadísticas y comparaciones incluidas
            </p>

            <p>
              <CheckCircle2 size={18} />
              El plan Free se limita por jugadores, juegos y equipos rivales
            </p>
          </div>

          {billing?.plan_slug !== 'pro' && whatsappNumber && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-billing-upgrade"
            >
              <MessageCircle size={20} />
              Solicitar actualización a Pro
            </a>
          )}

          <div className="admin-billing-payment-box">
            <h3>Pago manual</h3>

            <p>{paymentInfo?.transfer}</p>

            <small>
              {paymentInfo?.note}
            </small>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminBillingPage