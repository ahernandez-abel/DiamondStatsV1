import { pool } from '../config/db.js'

export const getAdminDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId

    const tenantResult = await pool.query(
      `
      SELECT id, name, slug, status
      FROM tenants
      WHERE id = $1
      LIMIT 1
      `,
      [tenantId]
    )

    const totalsResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM players WHERE tenant_id = $1) AS total_players,
        (SELECT COUNT(*) FROM teams WHERE tenant_id = $1) AS total_teams,
        (SELECT COUNT(*) FROM games WHERE tenant_id = $1) AS total_games,
        (SELECT COUNT(*) FROM games WHERE tenant_id = $1 AND status = 'completed') AS completed_games
      `,
      [tenantId]
    )

    const recentGamesResult = await pool.query(
      `
      SELECT
        g.id,
        g.game_date,
        g.status,
        home.name AS home_team,
        away.name AS away_team,
        g.home_score,
        g.away_score
      FROM games g
      LEFT JOIN teams home
        ON home.id = g.home_team_id
        AND home.tenant_id = g.tenant_id
      LEFT JOIN teams away
        ON away.id = g.away_team_id
        AND away.tenant_id = g.tenant_id
      WHERE g.tenant_id = $1
      ORDER BY g.game_date DESC
      LIMIT 5
      `,
      [tenantId]
    )

    const topBattersResult = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,
        COALESCE(SUM(bs.ab), 0) AS ab,
        COALESCE(SUM(bs.h), 0) AS h,
        ROUND(
          CASE
            WHEN COALESCE(SUM(bs.ab), 0) = 0 THEN 0
            ELSE COALESCE(SUM(bs.h), 0)::numeric / NULLIF(SUM(bs.ab), 0)
          END,
          3
        ) AS avg
      FROM batting_stats bs
      JOIN players p
        ON p.id = bs.player_id
        AND p.tenant_id = bs.tenant_id
      WHERE bs.tenant_id = $1
      GROUP BY p.id, p.full_name, p.photo_url
      ORDER BY avg DESC, h DESC
      LIMIT 5
      `,
      [tenantId]
    )

    const topPitchersResult = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,
        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (COALESCE(SUM(ps.er), 0)::numeric * 21) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS era,
        COALESCE(SUM(ps.so), 0) AS strikeouts
      FROM pitching_stats ps
      JOIN players p
        ON p.id = ps.player_id
        AND p.tenant_id = ps.tenant_id
      WHERE ps.tenant_id = $1
      GROUP BY p.id, p.full_name, p.photo_url
      ORDER BY era ASC, strikeouts DESC
      LIMIT 5
      `,
      [tenantId]
    )

    res.json({
      ok: true,
      tenant: tenantResult.rows[0] || null,
      totals: totalsResult.rows[0],
      recentGames: recentGamesResult.rows,
      topBatters: topBattersResult.rows,
      topPitchers: topPitchersResult.rows,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error cargando dashboard administrativo',
    })
  }
}