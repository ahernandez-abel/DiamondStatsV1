import { pool } from '../config/db.js';

export const getMyBilling = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;

    const result = await pool.query(
      `
      SELECT
        tenants.id AS tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status,

        plans.id AS plan_id,
        plans.name AS plan_name,
        plans.slug AS plan_slug,
        plans.description,
        plans.price_monthly,
        plans.currency,
        plans.max_players,
        plans.max_games,
        plans.max_rival_teams,
        plans.allow_custom_logo,
        plans.allow_advanced_stats,
        plans.allow_player_compare,

        tenant_subscriptions.status AS subscription_status,
        tenant_subscriptions.started_at,
        tenant_subscriptions.expires_at,

        (SELECT COUNT(*) FROM players WHERE tenant_id = $1)::int AS total_players,
        (SELECT COUNT(*) FROM games WHERE tenant_id = $1)::int AS total_games,
        (SELECT COUNT(*) FROM teams WHERE tenant_id = $1 AND is_main = false)::int AS total_rival_teams
      FROM tenants
      LEFT JOIN tenant_subscriptions
        ON tenant_subscriptions.tenant_id = tenants.id
        AND tenant_subscriptions.status = 'active'
      LEFT JOIN plans
        ON plans.id = tenant_subscriptions.plan_id
      WHERE tenants.id = $1
      LIMIT 1
      `,
      [tenantId]
    );

    res.json({
      ok: true,
      billing: result.rows[0],
      paymentInfo: {
        whatsapp: '18094472022',
        transfer: 'Banco Popular / Cuenta 804584795 / Abel Hernandez',
        note: 'Luego de realizar el pago, envía el comprobante por WhatsApp.',
      },
    });
  } catch (error) {
    next(error);
  }
};