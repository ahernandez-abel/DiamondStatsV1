import { pool } from '../config/db.js'

const DEFAULT_TENANT_ID = 1

const getTenantId = (req) => {
  return req.tenantId || req.user?.tenant_id || DEFAULT_TENANT_ID
}

const getTenantPlanLimits = async (tenantId) => {
  const result = await pool.query(
    `
    SELECT
      t.id AS tenant_id,
      COALESCE(p.slug, t.plan, 'free') AS plan_slug,
      p.max_rival_teams
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

  return result.rows[0]
}

export const getTeams = async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)

    const result = await pool.query(
      `
      SELECT
        t.*,

        COALESCE(
          COUNT(g.id) FILTER (
            WHERE
              g.status = 'final'
              AND g.tenant_id = t.tenant_id
              AND (
                (g.home_team_id = t.id AND g.home_score > g.away_score)
                OR
                (g.away_team_id = t.id AND g.away_score > g.home_score)
              )
          ),
          0
        ) AS wins,

        COALESCE(
          COUNT(g.id) FILTER (
            WHERE
              g.status = 'final'
              AND g.tenant_id = t.tenant_id
              AND (
                (g.home_team_id = t.id AND g.home_score < g.away_score)
                OR
                (g.away_team_id = t.id AND g.away_score < g.home_score)
              )
          ),
          0
        ) AS losses

      FROM teams t

      LEFT JOIN games g
        ON g.tenant_id = t.tenant_id
        AND (
          g.home_team_id = t.id
          OR g.away_team_id = t.id
        )

      WHERE t.tenant_id = $1

      GROUP BY t.id

      ORDER BY t.is_main DESC, t.name ASC
      `,
      [tenantId]
    )

    res.json({
      ok: true,
      teams: result.rows,
    })
  } catch (error) {
    next(error)
  }
}

export const getTeamById = async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT *
      FROM teams
      WHERE id = $1
      AND tenant_id = $2
      LIMIT 1
      `,
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Equipo no encontrado',
      })
    }

    res.json({
      ok: true,
      team: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const createTeam = async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)

    const {
      name,
      short_name,
      logo_url,
      primary_color,
      secondary_color,
      manager_name,
      city,
      is_main,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del equipo rival es obligatorio.',
      })
    }

    const isMainTeam = is_main === true

    if (!isMainTeam) {
      const plan = await getTenantPlanLimits(tenantId)

      if (!plan) {
        return res.status(404).json({
          ok: false,
          message: 'Tenant no encontrado.',
        })
      }

      const maxRivalTeams = plan.max_rival_teams

      if (maxRivalTeams !== null && maxRivalTeams !== undefined) {
        const countResult = await pool.query(
          `
          SELECT COUNT(*)::int AS total
          FROM teams
          WHERE tenant_id = $1
          AND COALESCE(is_main, false) = false
          `,
          [tenantId]
        )

        const totalRivals = countResult.rows[0]?.total || 0

        if (totalRivals >= maxRivalTeams) {
          return res.status(403).json({
            ok: false,
            message: `El plan ${plan.plan_slug.toUpperCase()} permite un máximo de ${maxRivalTeams} equipos rivales.`,
          })
        }
      }
    }

    const result = await pool.query(
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        tenantId,
        name.trim(),
        short_name || null,
        logo_url || null,
        primary_color || null,
        secondary_color || null,
        manager_name || null,
        city || null,
        isMainTeam,
      ]
    )

    res.status(201).json({
      ok: true,
      message: isMainTeam
        ? 'Equipo principal creado correctamente.'
        : 'Equipo rival registrado correctamente.',
      team: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const updateTeam = async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const {
      name,
      short_name,
      logo_url,
      primary_color,
      secondary_color,
      manager_name,
      city,
    } = req.body

    const result = await pool.query(
      `
      UPDATE teams
      SET
        name = $1,
        short_name = $2,
        logo_url = $3,
        primary_color = $4,
        secondary_color = $5,
        manager_name = $6,
        city = $7,
        updated_at = NOW()
      WHERE id = $8
      AND tenant_id = $9
      RETURNING *
      `,
      [
        name,
        short_name,
        logo_url,
        primary_color,
        secondary_color,
        manager_name,
        city,
        id,
        tenantId,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Equipo no encontrado',
      })
    }

    res.json({
      ok: true,
      team: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTeam = async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const teamResult = await pool.query(
      `
      SELECT id, is_main
      FROM teams
      WHERE id = $1
      AND tenant_id = $2
      LIMIT 1
      `,
      [id, tenantId]
    )

    const team = teamResult.rows[0]

    if (!team) {
      return res.status(404).json({
        ok: false,
        message: 'Equipo no encontrado',
      })
    }

    if (team.is_main) {
      return res.status(403).json({
        ok: false,
        message: 'No puedes eliminar el equipo principal del tenant.',
      })
    }

    const result = await pool.query(
      `
      DELETE FROM teams
      WHERE id = $1
      AND tenant_id = $2
      RETURNING id
      `,
      [id, tenantId]
    )

    res.json({
      ok: true,
      message: 'Equipo rival eliminado correctamente',
      deleted_team_id: result.rows[0].id,
    })
  } catch (error) {
    next(error)
  }
}