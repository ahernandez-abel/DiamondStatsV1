import crypto from 'crypto'
import { pool } from '../config/db.js'
import { logAudit } from '../helpers/auditLogger.js'

const generateAccessCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export const getSuperadminTenantDetail = async (req, res, next) => {
  try {
    const { tenantId } = req.params

    const tenantResult = await pool.query(
      `
      SELECT
        t.*,

        p.id AS plan_id,
        COALESCE(p.name, t.plan, 'Sin plan') AS plan_name,
        COALESCE(p.slug, t.plan, 'free') AS plan_slug,
        p.price_monthly,
        p.currency,
        p.max_players,
        p.max_games,
        p.max_rival_teams,

        ts.status AS subscription_status,
        ts.started_at,
        ts.expires_at,

        (SELECT COUNT(*) FROM users WHERE tenant_id = t.id)::int AS total_users,
        (SELECT COUNT(*) FROM teams WHERE tenant_id = t.id)::int AS total_teams,
        (
          SELECT COUNT(*)
          FROM teams
          WHERE tenant_id = t.id
          AND COALESCE(is_main, false) = false
        )::int AS total_rival_teams,
        (SELECT COUNT(*) FROM players WHERE tenant_id = t.id)::int AS total_players,
        (SELECT COUNT(*) FROM games WHERE tenant_id = t.id)::int AS total_games,

        (
          (SELECT COUNT(*) FROM batting_stats WHERE tenant_id = t.id) +
          (SELECT COUNT(*) FROM pitching_stats WHERE tenant_id = t.id) +
          (SELECT COUNT(*) FROM fielding_stats WHERE tenant_id = t.id)
        )::int AS total_stats,

        (SELECT MAX(last_activity_at) FROM users WHERE tenant_id = t.id) AS last_activity_at,
        (SELECT MAX(last_login_at) FROM users WHERE tenant_id = t.id) AS last_login_at

      FROM tenants t
      LEFT JOIN tenant_subscriptions ts
        ON ts.tenant_id = t.id
        AND ts.status = 'active'
      LEFT JOIN plans p
        ON p.id = ts.plan_id
      WHERE t.id = $1
      LIMIT 1
      `,
      [tenantId]
    )

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      })
    }

    const usersResult = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        is_active,
        last_login_at,
        last_activity_at,
        created_at
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
    )

    const paymentsResult = await pool.query(
      `
      SELECT
        payments.*,
        plans.name AS plan_name,
        plans.slug AS plan_slug,
        users.username AS created_by_name
      FROM payments
      LEFT JOIN plans ON plans.id = payments.plan_id
      LEFT JOIN users ON users.id = payments.created_by
      WHERE payments.tenant_id = $1
      ORDER BY payments.paid_at DESC NULLS LAST, payments.created_at DESC
      LIMIT 30
      `,
      [tenantId]
    )

    const alertsResult = await pool.query(
      `
      SELECT *
      FROM system_alerts
      WHERE tenant_id = $1
      ORDER BY is_resolved ASC, created_at DESC
      LIMIT 30
      `,
      [tenantId]
    )

    const activityResult = await pool.query(
      `
      SELECT
        tal.*,
        users.username,
        users.email
      FROM tenant_activity_logs tal
      LEFT JOIN users ON users.id = tal.user_id
      WHERE tal.tenant_id = $1
      ORDER BY tal.created_at DESC
      LIMIT 50
      `,
      [tenantId]
    )

    res.json({
      ok: true,
      tenant: tenantResult.rows[0],
      users: usersResult.rows,
      payments: paymentsResult.rows,
      alerts: alertsResult.rows,
      recentActivity: activityResult.rows,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTenantPrivacy = async (req, res, next) => {
  try {
    const { tenantId } = req.params
    const { is_public } = req.body

    if (typeof is_public !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message: 'is_public debe ser true o false',
      })
    }

    const result = await pool.query(
      `
      UPDATE tenants
      SET is_public = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [is_public, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'update_privacy',
      module: 'superadmin_tenants',
      entity_type: 'tenant',
      entity_id: tenantId,
      new_data: { is_public },
      description: `Privacidad cambiada a ${is_public ? 'público' : 'privado'}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Privacidad actualizada correctamente',
      tenant: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const regenerateTenantAccessCode = async (req, res, next) => {
  try {
    const { tenantId } = req.params
    const accessCode = generateAccessCode()

    const result = await pool.query(
      `
      UPDATE tenants
      SET access_code = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, slug, access_code
      `,
      [accessCode, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'regenerate_access_code',
      module: 'superadmin_tenants',
      entity_type: 'tenant',
      entity_id: tenantId,
      description: 'Código privado regenerado',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Código regenerado correctamente',
      tenant: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const updateTenantAdvancedStatus = async (req, res, next) => {
  try {
    const { tenantId } = req.params
    const { status, suspension_reason = null } = req.body

    const allowedStatuses = ['active', 'inactive', 'suspended']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Estado no válido',
      })
    }

    const result = await pool.query(
      `
      UPDATE tenants
      SET status = $1,
          suspended_at = CASE WHEN $1 = 'suspended' THEN NOW() ELSE NULL END,
          suspension_reason = CASE WHEN $1 = 'suspended' THEN $2 ELSE NULL END,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [status, suspension_reason, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'update_status',
      module: 'superadmin_tenants',
      entity_type: 'tenant',
      entity_id: tenantId,
      new_data: { status, suspension_reason },
      description: `Estado cambiado a ${status}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Estado actualizado correctamente',
      tenant: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const updateTenantUserBySuperAdmin = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.params
    const { username, email, role = 'admin', is_active = true } = req.body

    if (!username || !email) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre y el email son obligatorios',
      })
    }

    if (role !== 'admin') {
      return res.status(400).json({
        ok: false,
        message: 'Solo se pueden editar usuarios administradores',
      })
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        username = $1,
        email = $2,
        role = 'admin',
        is_active = $3
      WHERE id = $4
      AND tenant_id = $5
      AND role = 'admin'
      RETURNING
        id,
        username,
        email,
        role,
        is_active,
        tenant_id,
        last_login_at,
        last_activity_at,
        created_at
      `,
      [username, email, is_active, userId, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'update_admin_user',
      module: 'superadmin_tenants',
      entity_type: 'user',
      entity_id: userId,
      new_data: {
        username,
        email,
        role: 'admin',
        is_active,
      },
      description: `Administrador ${username} actualizado por superadmin`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Administrador actualizado correctamente',
      user: result.rows[0],
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario con ese nombre o email',
      })
    }

    next(error)
  }
}

export const changeTenantUserPasswordBySuperAdmin = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener mínimo 6 caracteres',
      })
    }

    const result = await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      AND tenant_id = $3
      AND role = 'admin'
      RETURNING
        id,
        username,
        email,
        role,
        is_active,
        tenant_id
      `,
      [password, userId, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'change_admin_password',
      module: 'superadmin_tenants',
      entity_type: 'user',
      entity_id: userId,
      description: `Contraseña cambiada al administrador ${result.rows[0].username}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Contraseña actualizada correctamente',
      user: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTenantUserBySuperAdmin = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.params

    const adminsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total_admins
      FROM users
      WHERE tenant_id = $1
      AND role = 'admin'
      `,
      [tenantId]
    )

    if (adminsResult.rows[0].total_admins <= 1) {
      return res.status(400).json({
        ok: false,
        message: 'No puedes eliminar el único administrador del tenant',
      })
    }

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      AND tenant_id = $2
      AND role = 'admin'
      RETURNING
        id,
        username,
        email,
        role,
        tenant_id
      `,
      [userId, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      })
    }

    await logAudit({
      tenant_id: tenantId,
      user_id: req.user?.id || null,
      action: 'delete_admin_user',
      module: 'superadmin_tenants',
      entity_type: 'user',
      entity_id: userId,
      old_data: result.rows[0],
      description: `Administrador ${result.rows[0].username} eliminado por superadmin`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    })

    res.json({
      ok: true,
      message: 'Administrador eliminado correctamente',
      user: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}