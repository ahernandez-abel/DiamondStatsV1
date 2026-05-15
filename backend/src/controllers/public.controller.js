import { pool } from '../config/db.js';

const getTenantBySlug = async (tenantSlug) => {
  const result = await pool.query(
    `
    SELECT id, name, slug, status
    FROM tenants
    WHERE slug = $1
    AND status = 'active'
    LIMIT 1
    `,
    [tenantSlug]
  );

  return result.rows[0];
};

export const getPublicHome = async (req, res) => {
  try {
    const { tenantSlug } = req.params;

    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return res.status(404).json({
        ok: false,
        message: 'Equipo público no encontrado',
      });
    }

    const tenantId = tenant.id;

    const teams = await pool.query(
      `
      SELECT *
      FROM teams
      WHERE tenant_id = $1
      ORDER BY name ASC
      `,
      [tenantId]
    );

    const players = await pool.query(
      `
      SELECT
        p.*,
        t.name AS team_name,
        t.primary_color
      FROM players p
      LEFT JOIN teams t
        ON t.id = p.team_id
        AND t.tenant_id = p.tenant_id
      WHERE p.tenant_id = $1
      AND p.is_active = true
      ORDER BY p.full_name ASC
      `,
      [tenantId]
    );

    const games = await pool.query(
      `
      SELECT
        g.*,
        ht.name AS home_team_name,
        at.name AS away_team_name
      FROM games g
      LEFT JOIN teams ht
        ON ht.id = g.home_team_id
        AND ht.tenant_id = g.tenant_id
      LEFT JOIN teams at
        ON at.id = g.away_team_id
        AND at.tenant_id = g.tenant_id
      WHERE g.tenant_id = $1
      ORDER BY g.game_date DESC
      LIMIT 5
      `,
      [tenantId]
    );

    const batting = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,
        p.position,
        t.name AS team_name,
        t.primary_color,

        COUNT(DISTINCT bs.game_id) AS games_played,
        COALESCE(SUM(bs.ab), 0) AS ab,

        COALESCE(
          GREATEST(
            SUM(bs.h),
            SUM(bs.doubles) + SUM(bs.triples) + SUM(bs.hr)
          ),
          0
        ) AS h,

        COALESCE(SUM(bs.doubles), 0) AS doubles,
        COALESCE(SUM(bs.triples), 0) AS triples,
        COALESCE(SUM(bs.hr), 0) AS hr,
        COALESCE(SUM(bs.rbi), 0) AS rbi,
        COALESCE(SUM(bs.r), 0) AS runs,
        COALESCE(SUM(bs.bb), 0) AS bb,
        COALESCE(SUM(bs.so), 0) AS so,
        COALESCE(SUM(bs.sb), 0) AS sb,
        COALESCE(SUM(bs.cs), 0) AS cs,
        COALESCE(SUM(bs.hbp), 0) AS hbp,
        COALESCE(SUM(bs.sf), 0) AS sf,

        ROUND(
          CASE
            WHEN COALESCE(SUM(bs.ab), 0) = 0 THEN 0
            ELSE
              GREATEST(
                SUM(bs.h),
                SUM(bs.doubles) + SUM(bs.triples) + SUM(bs.hr)
              )::numeric / NULLIF(SUM(bs.ab), 0)
          END,
          3
        ) AS avg,

        ROUND(
          CASE
            WHEN (
              COALESCE(SUM(bs.ab), 0)
              + COALESCE(SUM(bs.bb), 0)
              + COALESCE(SUM(bs.hbp), 0)
              + COALESCE(SUM(bs.sf), 0)
            ) = 0 THEN 0
            ELSE (
              GREATEST(
                SUM(bs.h),
                SUM(bs.doubles) + SUM(bs.triples) + SUM(bs.hr)
              )
              + COALESCE(SUM(bs.bb), 0)
              + COALESCE(SUM(bs.hbp), 0)
            )::numeric
            /
            NULLIF(
              (
                COALESCE(SUM(bs.ab), 0)
                + COALESCE(SUM(bs.bb), 0)
                + COALESCE(SUM(bs.hbp), 0)
                + COALESCE(SUM(bs.sf), 0)
              ),
              0
            )
          END,
          3
        ) AS obp,

        ROUND(
          CASE
            WHEN COALESCE(SUM(bs.ab), 0) = 0 THEN 0
            ELSE (
              (
                GREATEST(
                  SUM(bs.h),
                  SUM(bs.doubles) + SUM(bs.triples) + SUM(bs.hr)
                )
                - COALESCE(SUM(bs.doubles), 0)
                - COALESCE(SUM(bs.triples), 0)
                - COALESCE(SUM(bs.hr), 0)
              )
              + (COALESCE(SUM(bs.doubles), 0) * 2)
              + (COALESCE(SUM(bs.triples), 0) * 3)
              + (COALESCE(SUM(bs.hr), 0) * 4)
            )::numeric / NULLIF(SUM(bs.ab), 0)
          END,
          3
        ) AS slg

      FROM batting_stats bs
      JOIN players p
        ON p.id = bs.player_id
        AND p.tenant_id = bs.tenant_id
      LEFT JOIN teams t
        ON t.id = p.team_id
        AND t.tenant_id = bs.tenant_id
      WHERE bs.tenant_id = $1
      GROUP BY
        p.id,
        p.full_name,
        p.photo_url,
        p.position,
        t.name,
        t.primary_color
      ORDER BY avg DESC, h DESC
      `,
      [tenantId]
    );

    const battingRows = batting.rows.map((player) => ({
      ...player,
      ops: (
        Number(player.obp || 0) +
        Number(player.slg || 0)
      ).toFixed(3),
    }));

    const pitching = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,

        COALESCE(SUM(ps.outs_recorded), 0) AS outs_recorded,

        ROUND(
          COALESCE(SUM(ps.outs_recorded), 0)::numeric / 3,
          1
        ) AS ip,

        COALESCE(SUM(ps.so), 0) AS strikeouts,
        COALESCE(SUM(ps.bb), 0) AS walks,
        COALESCE(SUM(ps.er), 0) AS earned_runs,
        COALESCE(SUM(ps.r_allowed), 0) AS runs_allowed,
        COALESCE(SUM(ps.hits_allowed), 0) AS hits_allowed,
        COALESCE(SUM(ps.hr_allowed), 0) AS hr_allowed,
        COALESCE(SUM(ps.hbp), 0) AS hbp,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (
              COALESCE(SUM(ps.er), 0)::numeric * 21
            ) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS era,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (
              (
                COALESCE(SUM(ps.bb), 0)
                + COALESCE(SUM(ps.hits_allowed), 0)
              )::numeric * 3
            ) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS whip

      FROM pitching_stats ps
      JOIN players p
        ON p.id = ps.player_id
        AND p.tenant_id = ps.tenant_id
      WHERE ps.tenant_id = $1
      GROUP BY
        p.id,
        p.full_name,
        p.photo_url
      ORDER BY era ASC
      `,
      [tenantId]
    );

    const fielding = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,

        COALESCE(SUM(fs.putouts), 0) AS putouts,
        COALESCE(SUM(fs.assists), 0) AS assists,
        COALESCE(SUM(fs.errors), 0) AS errors,
        COALESCE(SUM(fs.passed_balls), 0) AS passed_balls,

        ROUND(
          CASE
            WHEN (
              COALESCE(SUM(fs.putouts), 0)
              + COALESCE(SUM(fs.assists), 0)
              + COALESCE(SUM(fs.errors), 0)
            ) = 0 THEN 0
            ELSE (
              COALESCE(SUM(fs.putouts), 0)
              + COALESCE(SUM(fs.assists), 0)
            )::numeric
            /
            NULLIF(
              (
                COALESCE(SUM(fs.putouts), 0)
                + COALESCE(SUM(fs.assists), 0)
                + COALESCE(SUM(fs.errors), 0)
              ),
              0
            )
          END,
          3
        ) AS fielding_pct

      FROM fielding_stats fs
      JOIN players p
        ON p.id = fs.player_id
        AND p.tenant_id = fs.tenant_id
      WHERE fs.tenant_id = $1
      GROUP BY
        p.id,
        p.full_name,
        p.photo_url
      ORDER BY fielding_pct DESC
      `,
      [tenantId]
    );

    const mvp = await pool.query(
      `
      WITH latest_month AS (
        SELECT
          EXTRACT(MONTH FROM MAX(g.game_date)) AS month,
          EXTRACT(YEAR FROM MAX(g.game_date)) AS year
        FROM batting_stats bs
        JOIN games g
          ON g.id = bs.game_id
          AND g.tenant_id = bs.tenant_id
        WHERE bs.tenant_id = $1
      )

      SELECT
        p.id,
        p.full_name,
        p.photo_url,

        COALESCE(SUM(bs.ab), 0) AS ab,
        COALESCE(SUM(bs.h), 0) AS hits,
        COALESCE(SUM(bs.doubles), 0) AS doubles,
        COALESCE(SUM(bs.triples), 0) AS triples,
        COALESCE(SUM(bs.hr), 0) AS hr,
        COALESCE(SUM(bs.rbi), 0) AS rbi,
        COALESCE(SUM(bs.r), 0) AS runs,
        COALESCE(SUM(bs.bb), 0) AS bb,
        COALESCE(SUM(bs.sb), 0) AS sb,

        ROUND(
          CASE
            WHEN COALESCE(SUM(bs.ab), 0) = 0 THEN 0
            ELSE COALESCE(SUM(bs.h), 0)::numeric / NULLIF(SUM(bs.ab), 0)
          END,
          3
        ) AS avg,

        ROUND(
          (
            (COALESCE(SUM(bs.hr), 0) * 4)
            + (COALESCE(SUM(bs.triples), 0) * 3)
            + (COALESCE(SUM(bs.doubles), 0) * 2)
            + (COALESCE(SUM(bs.h), 0) * 1)
            + (COALESCE(SUM(bs.rbi), 0) * 1)
            + (COALESCE(SUM(bs.r), 0) * 1)
            + (COALESCE(SUM(bs.sb), 0) * 1)
            + (COALESCE(SUM(bs.bb), 0) * 0.5)
          )::numeric,
          2
        ) AS mvp_points

      FROM batting_stats bs
      JOIN players p
        ON p.id = bs.player_id
        AND p.tenant_id = bs.tenant_id
      JOIN games g
        ON g.id = bs.game_id
        AND g.tenant_id = bs.tenant_id
      CROSS JOIN latest_month lm
      WHERE bs.tenant_id = $1
        AND EXTRACT(MONTH FROM g.game_date) = lm.month
        AND EXTRACT(YEAR FROM g.game_date) = lm.year
      GROUP BY
        p.id,
        p.full_name,
        p.photo_url
      ORDER BY mvp_points DESC
      LIMIT 1
      `,
      [tenantId]
    );

    res.json({
      ok: true,
      tenant,
      teams: teams.rows,
      players: players.rows,
      games: games.rows,
      batting: battingRows,
      pitching: pitching.rows,
      fielding: fielding.rows,
      mvp: mvp.rows[0] || null,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error cargando página pública',
    });
  }
};