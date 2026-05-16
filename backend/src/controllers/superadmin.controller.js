import { pool } from '../config/db.js';

export const getSuperAdminStats = async (req, res, next) => {
  try {
    const tenantsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_tenants
      FROM tenants
    `);

    const activeTenantsResult = await pool.query(`
      SELECT COUNT(*)::int AS active_tenants
      FROM tenants
      WHERE status = 'active'
    `);

    const usersResult = await pool.query(`
      SELECT COUNT(*)::int AS total_users
      FROM users
      WHERE role != 'superadmin'
    `);

    const teamsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_teams
      FROM teams
    `);

    res.json({
      ok: true,
      stats: {
        total_tenants: tenantsResult.rows[0].total_tenants,
        active_tenants: activeTenantsResult.rows[0].active_tenants,
        total_users: usersResult.rows[0].total_users,
        total_teams: teamsResult.rows[0].total_teams,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTenants = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        tenants.id,
        tenants.name,
        tenants.slug,
        tenants.status,
        tenants.plan,
        tenants.is_public,
        tenants.access_code,
        tenants.logo_url,
        tenants.created_at,
        COUNT(users.id)::int AS total_users,
        COUNT(teams.id)::int AS total_teams
      FROM tenants
      LEFT JOIN users ON users.tenant_id = tenants.id
      LEFT JOIN teams ON teams.tenant_id = tenants.id
      GROUP BY tenants.id
      ORDER BY tenants.created_at DESC
    `);

    res.json({
      ok: true,
      tenants: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createTenantManual = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      name,
      slug,
      plan = 'free',
      is_public = true,
      access_code = null,
      logo_url = null,

      admin_username,
      admin_email,
      admin_password,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre y el slug son obligatorios',
      });
    }

    if (!admin_username || !admin_email || !admin_password) {
      return res.status(400).json({
        ok: false,
        message: 'Los datos del admin son obligatorios',
      });
    }

    await client.query('BEGIN');

    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        name,
        slug,
        status,
        plan,
        is_public,
        access_code,
        logo_url
      )
      VALUES ($1, $2, 'active', $3, $4, $5, $6)
      RETURNING *
      `,
      [name, slug, plan, is_public, access_code, logo_url]
    );

    const tenant = tenantResult.rows[0];

    const teamResult = await client.query(
      `
      INSERT INTO teams (
        tenant_id,
        name,
        is_main
      )
      VALUES ($1, $2, true)
      RETURNING *
      `,
      [tenant.id, tenant.name]
    );

    const mainTeam = teamResult.rows[0];

    const adminResult = await client.query(
      `
      INSERT INTO users (
        username,
        email,
        password,
        role,
        is_active,
        tenant_id
      )
      VALUES ($1, $2, $3, 'admin', true, $4)
      RETURNING
        id,
        username,
        email,
        role,
        is_active,
        tenant_id
      `,
      [
        admin_username,
        admin_email,
        admin_password,
        tenant.id,
      ]
    );

    const admin = adminResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      ok: true,
      message: 'Tenant, equipo principal y admin creados correctamente',
      tenant,
      mainTeam,
      admin,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un tenant con ese slug o un usuario con ese email',
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

export const updateTenantStatus = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['active', 'inactive', 'suspended'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Estado no válido',
      });
    }

    const result = await pool.query(
      `
      UPDATE tenants
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      });
    }

    res.json({
      ok: true,
      message: 'Estado actualizado correctamente',
      tenant: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenantPlan = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { plan } = req.body;

    const allowedPlans = ['free', 'basic', 'pro', 'premium'];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        ok: false,
        message: 'Plan no válido',
      });
    }

    const result = await pool.query(
      `
      UPDATE tenants
      SET plan = $1
      WHERE id = $2
      RETURNING *
      `,
      [plan, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado',
      });
    }

    res.json({
      ok: true,
      message: 'Plan actualizado correctamente',
      tenant: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};