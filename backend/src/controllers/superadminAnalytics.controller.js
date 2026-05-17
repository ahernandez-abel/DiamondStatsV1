import { pool } from '../config/db.js'
import {
  markAlertAsRead,
  resolveSystemAlert,
} from '../helpers/alertHelper.js'

export const getSuperadminOverview = async (req, res) => {
  try {
    const totalsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM tenants)::int AS total_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'active')::int AS active_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'suspended')::int AS suspended_tenants,
        (SELECT COUNT(*) FROM players)::int AS total_players,
        (SELECT COUNT(*) FROM games)::int AS total_games,
        (
          (SELECT COUNT(*) FROM batting_stats) +
          (SELECT COUNT(*) FROM pitching_stats) +
          (SELECT COUNT(*) FROM fielding_stats)
        )::int AS total_stats,
        (SELECT COUNT(*) FROM system_alerts WHERE is_resolved = false)::int AS open_alerts,
        (SELECT COUNT(*) FROM system_alerts WHERE is_read = false)::int AS unread_alerts
    `)

    const topTenantsResult = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.status,
        COUNT(tal.id)::int AS activity_count,
        MAX(tal.created_at) AS last_activity
      FROM tenants t
      LEFT JOIN tenant_activity_logs tal ON tal.tenant_id = t.id
      GROUP BY t.id
      ORDER BY activity_count DESC
      LIMIT 5
    `)

    const inactiveTenantsResult = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.status,
        MAX(u.last_activity_at) AS last_activity_at
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      WHERE t.status = 'active'
      GROUP BY t.id
      HAVING MAX(u.last_activity_at) IS NULL
         OR MAX(u.last_activity_at) < NOW() - INTERVAL '30 days'
      ORDER BY last_activity_at ASC NULLS FIRST
      LIMIT 10
    `)

    res.json({
      ok: true,
      overview: totalsResult.rows[0],
      topTenants: topTenantsResult.rows,
      inactiveTenants: inactiveTenantsResult.rows,
    })
  } catch (error) {
    console.error('Error en getSuperadminOverview:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo resumen del superadmin',
    })
  }
}

export const getTenantActivity = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tal.id,
        tal.tenant_id,
        t.name AS tenant_name,
        tal.user_id,
        u.username AS user_name,
        u.email AS user_email,
        tal.activity_type,
        tal.description,
        tal.entity_type,
        tal.entity_id,
        tal.ip_address,
        tal.created_at
      FROM tenant_activity_logs tal
      LEFT JOIN tenants t ON t.id = tal.tenant_id
      LEFT JOIN users u ON u.id = tal.user_id
      ORDER BY tal.created_at DESC
      LIMIT 200
    `)

    res.json({
      ok: true,
      activity: result.rows,
    })
  } catch (error) {
    console.error('Error en getTenantActivity:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo actividad',
    })
  }
}

export const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        al.id,
        al.tenant_id,
        t.name AS tenant_name,
        al.user_id,
        u.username AS user_name,
        u.email AS user_email,
        al.action,
        al.module,
        al.entity_type,
        al.entity_id,
        al.old_data,
        al.new_data,
        al.description,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN tenants t ON t.id = al.tenant_id
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT 200
    `)

    res.json({
      ok: true,
      auditLogs: result.rows,
    })
  } catch (error) {
    console.error('Error en getAuditLogs:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo auditoría',
    })
  }
}

export const getSystemAlerts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sa.id,
        sa.tenant_id,
        t.name AS tenant_name,
        t.slug AS tenant_slug,
        sa.alert_type,
        sa.severity,
        sa.title,
        sa.message,
        sa.is_read,
        sa.is_resolved,
        sa.resolved_at,
        sa.created_at
      FROM system_alerts sa
      LEFT JOIN tenants t ON t.id = sa.tenant_id
      ORDER BY
        sa.is_resolved ASC,
        sa.is_read ASC,
        sa.created_at DESC
      LIMIT 300
    `)

    res.json({
      ok: true,
      alerts: result.rows,
    })
  } catch (error) {
    console.error('Error en getSystemAlerts:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo alertas',
    })
  }
}

export const readAlert = async (req, res) => {
  try {
    const { id } = req.params

    const alert = await markAlertAsRead(id)

    res.json({
      ok: true,
      message: 'Alerta marcada como leída',
      alert,
    })
  } catch (error) {
    console.error('Error en readAlert:', error)

    res.status(500).json({
      ok: false,
      message: 'Error marcando alerta como leída',
    })
  }
}

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params

    const alert = await resolveSystemAlert(id)

    res.json({
      ok: true,
      message: 'Alerta resuelta correctamente',
      alert,
    })
  } catch (error) {
    console.error('Error en resolveAlert:', error)

    res.status(500).json({
      ok: false,
      message: 'Error resolviendo alerta',
    })
  }
}

export const getCommercialControl = async (req, res) => {
  try {
    const monthlyRevenueResult = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total_collected_this_month
      FROM payments
      WHERE paid_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND paid_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND status = 'paid'
    `)

    const expiringSoonResult = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        COALESCE(p.name, t.plan, 'Sin plan') AS plan_name,
        ts.expires_at
      FROM tenant_subscriptions ts
      INNER JOIN tenants t ON t.id = ts.tenant_id
      LEFT JOIN plans p ON p.id = ts.plan_id
      WHERE ts.expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY ts.expires_at ASC
    `)

    const expiredResult = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        COALESCE(p.name, t.plan, 'Sin plan') AS plan_name,
        ts.expires_at
      FROM tenant_subscriptions ts
      INNER JOIN tenants t ON t.id = ts.tenant_id
      LEFT JOIN plans p ON p.id = ts.plan_id
      WHERE ts.expires_at < CURRENT_DATE
      ORDER BY ts.expires_at ASC
    `)

    const freeNearLimitResult = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        COALESCE(p.slug, t.plan, 'free') AS plan_slug,
        COUNT(DISTINCT pl.id)::int AS players_count,
        COUNT(DISTINCT g.id)::int AS games_count,
        COUNT(DISTINCT CASE WHEN tm.is_main = false THEN tm.id END)::int AS rival_teams_count
      FROM tenants t
      LEFT JOIN tenant_subscriptions ts
        ON ts.tenant_id = t.id
        AND ts.status = 'active'
      LEFT JOIN plans p ON p.id = ts.plan_id
      LEFT JOIN players pl ON pl.tenant_id = t.id
      LEFT JOIN games g ON g.tenant_id = t.id
      LEFT JOIN teams tm ON tm.tenant_id = t.id
      WHERE LOWER(COALESCE(p.slug, t.plan, 'free')) = 'free'
      GROUP BY t.id, p.slug
      HAVING COUNT(DISTINCT pl.id) >= 12
          OR COUNT(DISTINCT g.id) >= 4
          OR COUNT(DISTINCT CASE WHEN tm.is_main = false THEN tm.id END) >= 2
      ORDER BY players_count DESC, games_count DESC
    `)

    res.json({
      ok: true,
      totalCollectedThisMonth:
        monthlyRevenueResult.rows[0]?.total_collected_this_month || 0,
      expiringSoon: expiringSoonResult.rows,
      expiredPayments: expiredResult.rows,
      freeNearLimit: freeNearLimitResult.rows,
    })
  } catch (error) {
    console.error('Error en getCommercialControl:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo control comercial',
    })
  }
}

export const getSystemHealth = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM players)::int AS total_players,
        (SELECT COUNT(*) FROM games)::int AS total_games,
        (SELECT COUNT(*) FROM batting_stats)::int AS total_batting_stats,
        (SELECT COUNT(*) FROM pitching_stats)::int AS total_pitching_stats,
        (SELECT COUNT(*) FROM fielding_stats)::int AS total_fielding_stats,
        (SELECT COUNT(*) FROM tenants WHERE status = 'suspended')::int AS suspended_tenants,
        (
          SELECT COUNT(*)
          FROM system_alerts
          WHERE severity = 'danger'
          AND is_resolved = false
        )::int AS critical_alerts
    `)

    res.json({
      ok: true,
      health: result.rows[0],
    })
  } catch (error) {
    console.error('Error en getSystemHealth:', error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo salud del sistema',
    })
  }
}