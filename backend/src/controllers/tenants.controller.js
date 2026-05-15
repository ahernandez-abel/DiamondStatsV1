import { pool } from '../config/db.js';

const normalizeSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export const createTenantOnboarding = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      tenant_name,
      tenant_slug,
      contact_email,
      whatsapp,

      team_name,
      short_name,
      primary_color,
      secondary_color,
      manager_name,
      city,

      admin_username,
      admin_email,
      admin_password,
    } = req.body;

    if (
      !tenant_name ||
      !team_name ||
      !admin_username ||
      !admin_email ||
      !admin_password
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan datos obligatorios',
      });
    }

    const slug = normalizeSlug(tenant_slug || tenant_name);

    await client.query('BEGIN');

    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        name,
        slug,
        contact_email,
        whatsapp,
        status
      )
      VALUES ($1,$2,$3,$4,'active')
      RETURNING *
      `,
      [
        tenant_name,
        slug,
        contact_email || admin_email,
        whatsapp || null,
      ]
    );

    const tenant = tenantResult.rows[0];

    const teamResult = await client.query(
      `
      INSERT INTO teams (
        tenant_id,
        name,
        short_name,
        primary_color,
        secondary_color,
        manager_name,
        city
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        tenant.id,
        team_name,
        short_name || null,
        primary_color || '#22c55e',
        secondary_color || '#0f172a',
        manager_name || null,
        city || null,
      ]
    );

    const team = teamResult.rows[0];

    const userResult = await client.query(
      `
      INSERT INTO users (
        tenant_id,
        username,
        email,
        password,
        role,
        is_active
      )
      VALUES ($1,$2,$3,$4,'admin',true)
      RETURNING id, tenant_id, username, email, role, is_active, created_at
      `,
      [
        tenant.id,
        admin_username,
        admin_email,
        admin_password,
      ]
    );

    const user = userResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      ok: true,
      message: 'Organización creada correctamente',
      tenant,
      team,
      user,
      public_url: `/team/${tenant.slug}`,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.log(error);

    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        message: 'El slug, usuario o email ya existe',
      });
    }

    res.status(500).json({
      ok: false,
      message: 'Error creando organización',
    });
  } finally {
    client.release();
  }
};