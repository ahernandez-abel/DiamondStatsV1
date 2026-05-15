import { pool } from '../config/db.js'

const normalizeSlug = (value = '') => {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const generateAccessCode = (name = '') => {
  const base = normalizeSlug(name)
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase() || 'TEAM'

  const random = Math.floor(1000 + Math.random() * 9000)

  return `${base}${random}`
}

const generateUniqueSlug = async (client, baseSlug) => {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const result = await client.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [slug]
    )

    if (result.rows.length === 0) {
      return slug
    }

    counter += 1
    slug = `${baseSlug}-${counter}`
  }
}

const generateUniqueAccessCode = async (client, tenantName) => {
  let accessCode = generateAccessCode(tenantName)

  while (true) {
    const result = await client.query(
      'SELECT id FROM tenants WHERE access_code = $1 LIMIT 1',
      [accessCode]
    )

    if (result.rows.length === 0) {
      return accessCode
    }

    accessCode = generateAccessCode(tenantName)
  }
}

export const createTenantOnboarding = async (req, res) => {
  const client = await pool.connect()

  try {
    const {
      tenant_name,
      tenant_slug,
      contact_email,
      whatsapp,
      plan,
      logo_url,
      is_public,

      team_name,
      short_name,
      primary_color,
      secondary_color,
      manager_name,
      city,

      admin_username,
      admin_email,
      admin_password,
    } = req.body

    if (!tenant_name || !admin_username || !admin_email || !admin_password) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan datos obligatorios para registrar el equipo.',
      })
    }

    const cleanTenantName = tenant_name.trim()
    const cleanTeamName = team_name?.trim() || cleanTenantName
    const cleanAdminUsername = admin_username.trim()
    const cleanAdminEmail = admin_email.trim().toLowerCase()
    const cleanContactEmail = contact_email?.trim().toLowerCase() || cleanAdminEmail

    const baseSlug = normalizeSlug(tenant_slug || cleanTenantName)

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del equipo no permite generar un slug válido.',
      })
    }

    await client.query('BEGIN')

    const existingUser = await client.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(username) = LOWER($2)
      LIMIT 1
      `,
      [cleanAdminEmail, cleanAdminUsername]
    )

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')

      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario con ese email o nombre de usuario.',
      })
    }

    const slug = await generateUniqueSlug(client, baseSlug)
    const accessCode = await generateUniqueAccessCode(client, cleanTenantName)

    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        name,
        slug,
        contact_email,
        whatsapp,
        status,
        access_code,
        is_public,
        plan,
        logo_url
      )
      VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8)
      RETURNING *
      `,
      [
        cleanTenantName,
        slug,
        cleanContactEmail,
        whatsapp?.trim() || null,
        accessCode,
        is_public ?? false,
        plan || 'basic',
        logo_url || null,
      ]
    )

    const tenant = tenantResult.rows[0]

    const teamResult = await client.query(
      `
      INSERT INTO teams (
        tenant_id,
        name,
        short_name,
        logo_url,
        primary_color,
        secondary_color,
        manager_name,
        city,
        is_main
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
      `,
      [
        tenant.id,
        cleanTeamName,
        short_name?.trim() || null,
        logo_url || null,
        primary_color || '#22c55e',
        secondary_color || '#0f172a',
        manager_name?.trim() || cleanAdminUsername,
        city?.trim() || null,
      ]
    )

    const team = teamResult.rows[0]

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
      VALUES ($1, $2, $3, $4, 'admin', true)
      RETURNING id, tenant_id, username, email, role, is_active, created_at
      `,
      [
        tenant.id,
        cleanAdminUsername,
        cleanAdminEmail,
        admin_password,
      ]
    )

    const user = userResult.rows[0]

    await client.query('COMMIT')

    return res.status(201).json({
      ok: true,
      message: 'Equipo registrado correctamente.',
      tenant,
      team,
      user,
      access_code: tenant.access_code,
      public_url: `/team/${tenant.slug}`,
      admin_url: '/login',
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error en createTenantOnboarding:', error)

    return res.status(500).json({
      ok: false,
      message: 'Error registrando el equipo.',
    })
  } finally {
    client.release()
  }
}