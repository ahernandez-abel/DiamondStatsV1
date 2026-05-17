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
      p.max_games
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

const validateTeamsBelongToTenant = async ({
  tenantId,
  home_team_id,
  away_team_id,
}) => {
  const result = await pool.query(
    `
    SELECT id
    FROM teams
    WHERE tenant_id = $1
    AND id IN ($2, $3)
    `,
    [tenantId, home_team_id, away_team_id]
  )

  return result.rows.length === 2
}

export const getGames = async (req, res) => {
  try {
    const tenantId = getTenantId(req)

    const result = await pool.query(
      `
      SELECT
        g.*,
        ht.name AS home_team_name,
        at.name AS away_team_name
      FROM games g
      LEFT JOIN teams ht
        ON g.home_team_id = ht.id
        AND ht.tenant_id = g.tenant_id
      LEFT JOIN teams at
        ON g.away_team_id = at.id
        AND at.tenant_id = g.tenant_id
      WHERE g.tenant_id = $1
      ORDER BY g.game_date DESC
      `,
      [tenantId]
    )

    res.json(result.rows)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo juegos',
    })
  }
}

export const getGameById = async (req, res) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT
        g.*,
        ht.name AS home_team_name,
        at.name AS away_team_name
      FROM games g
      LEFT JOIN teams ht
        ON g.home_team_id = ht.id
        AND ht.tenant_id = g.tenant_id
      LEFT JOIN teams at
        ON g.away_team_id = at.id
        AND at.tenant_id = g.tenant_id
      WHERE g.id = $1
      AND g.tenant_id = $2
      LIMIT 1
      `,
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Juego no encontrado',
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo juego',
    })
  }
}

export const createGame = async (req, res) => {
  try {
    const tenantId = getTenantId(req)

    const {
      home_team_id,
      away_team_id,
      game_date,
      game_time,
      venue,
      innings_played,
      status,
      notes,
    } = req.body

    if (!home_team_id || !away_team_id || !game_date) {
      return res.status(400).json({
        ok: false,
        message: 'Equipo local, equipo visitante y fecha son obligatorios.',
      })
    }

    if (Number(home_team_id) === Number(away_team_id)) {
      return res.status(400).json({
        ok: false,
        message: 'El equipo local y el rival no pueden ser el mismo.',
      })
    }

    const teamsAreValid = await validateTeamsBelongToTenant({
      tenantId,
      home_team_id,
      away_team_id,
    })

    if (!teamsAreValid) {
      return res.status(403).json({
        ok: false,
        message: 'Uno de los equipos no pertenece a este tenant.',
      })
    }

    const plan = await getTenantPlanLimits(tenantId)

    if (!plan) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant no encontrado.',
      })
    }

    const maxGames = plan.max_games

    if (maxGames !== null && maxGames !== undefined) {
      const countResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM games
        WHERE tenant_id = $1
        `,
        [tenantId]
      )

      const totalGames = countResult.rows[0]?.total || 0

      if (totalGames >= maxGames) {
        return res.status(403).json({
          ok: false,
          message: `El plan ${plan.plan_slug.toUpperCase()} permite un máximo de ${maxGames} juegos.`,
        })
      }
    }

    const result = await pool.query(
      `
      INSERT INTO games (
        tenant_id,
        home_team_id,
        away_team_id,
        game_date,
        game_time,
        venue,
        innings_played,
        status,
        notes,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        tenantId,
        home_team_id,
        away_team_id,
        game_date,
        game_time || null,
        venue || null,
        innings_played || 7,
        status || 'scheduled',
        notes || null,
        req.user?.id || null,
      ]
    )

    res.status(201).json({
      ok: true,
      message: 'Juego creado correctamente',
      game: result.rows[0],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error creando juego',
    })
  }
}

export const updateGame = async (req, res) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const {
      home_team_id,
      away_team_id,
      game_date,
      game_time,
      venue,
      home_score,
      away_score,
      innings_played,
      status,
      notes,
    } = req.body

    if (!home_team_id || !away_team_id || !game_date) {
      return res.status(400).json({
        ok: false,
        message: 'Equipo local, equipo visitante y fecha son obligatorios.',
      })
    }

    if (Number(home_team_id) === Number(away_team_id)) {
      return res.status(400).json({
        ok: false,
        message: 'El equipo local y el rival no pueden ser el mismo.',
      })
    }

    const teamsAreValid = await validateTeamsBelongToTenant({
      tenantId,
      home_team_id,
      away_team_id,
    })

    if (!teamsAreValid) {
      return res.status(403).json({
        ok: false,
        message: 'Uno de los equipos no pertenece a este tenant.',
      })
    }

    const result = await pool.query(
      `
      UPDATE games
      SET
        home_team_id = $1,
        away_team_id = $2,
        game_date = $3,
        game_time = $4,
        venue = $5,
        home_score = $6,
        away_score = $7,
        innings_played = $8,
        status = $9,
        notes = $10,
        updated_at = NOW()
      WHERE id = $11
      AND tenant_id = $12
      RETURNING *
      `,
      [
        home_team_id,
        away_team_id,
        game_date,
        game_time || null,
        venue || null,
        home_score,
        away_score,
        innings_played || 7,
        status || 'scheduled',
        notes || null,
        id,
        tenantId,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Juego no encontrado',
      })
    }

    res.json({
      ok: true,
      message: 'Juego actualizado correctamente',
      game: result.rows[0],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error actualizando juego',
    })
  }
}

export const deleteGame = async (req, res) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const result = await pool.query(
      `
      DELETE FROM games
      WHERE id = $1
      AND tenant_id = $2
      RETURNING *
      `,
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Juego no encontrado',
      })
    }

    res.json({
      ok: true,
      message: 'Juego eliminado correctamente',
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error eliminando juego',
    })
  }
}

export const updateGameResult = async (req, res) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const {
      home_score,
      away_score,
      status,
      notes,
    } = req.body

    const result = await pool.query(
      `
      UPDATE games
      SET
        home_score = $1,
        away_score = $2,
        status = $3,
        notes = $4,
        updated_at = NOW()
      WHERE id = $5
      AND tenant_id = $6
      RETURNING *
      `,
      [
        home_score,
        away_score,
        status || 'final',
        notes || null,
        id,
        tenantId,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Juego no encontrado',
      })
    }

    res.json({
      ok: true,
      message: 'Resultado publicado correctamente',
      game: result.rows[0],
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error publicando resultado',
    })
  }
}