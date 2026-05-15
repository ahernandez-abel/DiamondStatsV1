import {pool} from '../config/db.js'

const DEFAULT_TENANT_ID = 1;

const getTenantId = (req) => {
  return req.tenantId || req.user?.tenant_id || DEFAULT_TENANT_ID;
};

export const getBattingLeaders = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,
        p.position,
        teams.name AS team_name,
        teams.primary_color,

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

        COALESCE(
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
          + (COALESCE(SUM(bs.hr), 0) * 4),
          0
        ) AS tb,

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

      LEFT JOIN teams
        ON teams.id = p.team_id
        AND teams.tenant_id = bs.tenant_id

      WHERE bs.tenant_id = $1

      GROUP BY
        p.id,
        p.full_name,
        p.photo_url,
        p.position,
        teams.name,
        teams.primary_color

      ORDER BY avg DESC, h DESC
      `,
      [tenantId]
    );

    const leaders = result.rows.map((player) => ({
      ...player,
      ops: (
        Number(player.obp || 0) +
        Number(player.slg || 0)
      ).toFixed(3),
    }));

    res.json({
      ok: true,
      leaders,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes ofensivos',
    });
  }
};

export const getPitchingLeaders = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const result = await pool.query(
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
        ) AS whip,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (
              COALESCE(SUM(ps.so), 0)::numeric * 21
            ) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS k_per_7,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (
              COALESCE(SUM(ps.bb), 0)::numeric * 21
            ) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS bb_per_7,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ps.outs_recorded), 0) = 0 THEN 0
            ELSE (
              COALESCE(SUM(ps.hits_allowed), 0)::numeric * 21
            ) / NULLIF(SUM(ps.outs_recorded), 0)
          END,
          2
        ) AS h_per_7

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

    res.json({
      ok: true,
      leaders: result.rows,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes de pitcheo',
    });
  }
};

export const getFieldingLeaders = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.full_name,
        p.photo_url,

        COALESCE(SUM(fs.putouts), 0) AS putouts,
        COALESCE(SUM(fs.assists), 0) AS assists,
        COALESCE(SUM(fs.errors), 0) AS errors,

        COALESCE(SUM(fs.passed_balls), 0) AS passed_balls,

        (
          COALESCE(SUM(fs.putouts), 0)
          +
          COALESCE(SUM(fs.assists), 0)
          +
          COALESCE(SUM(fs.errors), 0)
        ) AS total_chances,

        ROUND(
          CASE
            WHEN (
              COALESCE(SUM(fs.putouts), 0)
              +
              COALESCE(SUM(fs.assists), 0)
              +
              COALESCE(SUM(fs.errors), 0)
            ) = 0 THEN 0

            ELSE (
              (
                COALESCE(SUM(fs.putouts), 0)
                +
                COALESCE(SUM(fs.assists), 0)
              )::numeric
              /
              NULLIF(
                (
                  COALESCE(SUM(fs.putouts), 0)
                  +
                  COALESCE(SUM(fs.assists), 0)
                  +
                  COALESCE(SUM(fs.errors), 0)
                ),
                0
              )
            )
          END,
          3
        ) AS fielding_pct,

        ROUND(
          (
            COALESCE(SUM(fs.putouts), 0)
            +
            COALESCE(SUM(fs.assists), 0)
          )::numeric,
          2
        ) AS range_factor

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

    res.json({
      ok: true,
      leaders: result.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes defensivos',
    });
  }
};
export const getMonthlyMVP = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const result = await pool.query(
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
            +
            (COALESCE(SUM(bs.triples), 0) * 3)
            +
            (COALESCE(SUM(bs.doubles), 0) * 2)
            +
            (COALESCE(SUM(bs.h), 0) * 1)
            +
            (COALESCE(SUM(bs.rbi), 0) * 1)
            +
            (COALESCE(SUM(bs.r), 0) * 1)
            +
            (COALESCE(SUM(bs.sb), 0) * 1)
            +
            (COALESCE(SUM(bs.bb), 0) * 0.5)
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
      mvp: result.rows[0] || null,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error calculando MVP mensual',
    });
  }
};

export const comparePlayersCommonGames = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { playerOneId, playerTwoId, equalAb } = req.query;

    if (!playerOneId || !playerTwoId) {
      return res.status(400).json({
        ok: false,
        message: 'Debes enviar los dos jugadores',
      });
    }

    const result = await pool.query(
      `
      WITH common_games AS (
        SELECT bs1.game_id
        FROM batting_stats bs1
        JOIN batting_stats bs2
          ON bs2.game_id = bs1.game_id
          AND bs2.tenant_id = bs1.tenant_id
        WHERE bs1.player_id = $1
          AND bs2.player_id = $2
          AND bs1.tenant_id = $4
          AND bs2.tenant_id = $4
      ),

      base_stats AS (
        SELECT
          bs.player_id,
          p.full_name,
          p.photo_url,
          p.position,
          t.name AS team_name,
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
          COALESCE(SUM(bs.sf), 0) AS sf
        FROM batting_stats bs
        JOIN common_games cg
          ON cg.game_id = bs.game_id
        JOIN players p
          ON p.id = bs.player_id
          AND p.tenant_id = bs.tenant_id
        LEFT JOIN teams t
          ON t.id = p.team_id
          AND t.tenant_id = bs.tenant_id
        WHERE bs.player_id IN ($1, $2)
          AND bs.tenant_id = $4
        GROUP BY
          bs.player_id,
          p.full_name,
          p.photo_url,
          p.position,
          t.name
      ),

      min_ab AS (
        SELECT MIN(ab) AS limit_ab FROM base_stats
      )

      SELECT
        b.*,
        (
          (b.h - b.doubles - b.triples - b.hr)
          + (b.doubles * 2)
          + (b.triples * 3)
          + (b.hr * 4)
        ) AS tb,

        ROUND(
          CASE
            WHEN b.ab = 0 THEN 0
            ELSE b.h::numeric / b.ab
          END,
          3
        ) AS avg,

        ROUND(
          CASE
            WHEN (b.ab + b.bb + b.hbp + b.sf) = 0 THEN 0
            ELSE (b.h + b.bb + b.hbp)::numeric / NULLIF((b.ab + b.bb + b.hbp + b.sf), 0)
          END,
          3
        ) AS obp,

        ROUND(
          CASE
            WHEN b.ab = 0 THEN 0
            ELSE (
              (b.h - b.doubles - b.triples - b.hr)
              + (b.doubles * 2)
              + (b.triples * 3)
              + (b.hr * 4)
            )::numeric / b.ab
          END,
          3
        ) AS slg,

        CASE
          WHEN $3 = 'true' AND b.ab > 0 THEN
            ROUND((b.h::numeric / b.ab) * (SELECT limit_ab FROM min_ab), 2)
          ELSE b.h
        END AS adjusted_hits,

        CASE
          WHEN $3 = 'true' THEN (SELECT limit_ab FROM min_ab)
          ELSE b.ab
        END AS compared_ab

      FROM base_stats b
      ORDER BY b.player_id
      `,
      [playerOneId, playerTwoId, equalAb || 'false', tenantId]
    );

    const players = result.rows.map((p) => ({
      ...p,
      ops: (Number(p.obp || 0) + Number(p.slg || 0)).toFixed(3),
    }));

    res.json({
      ok: true,
      mode: equalAb === 'true' ? 'same_games_equal_ab' : 'same_games',
      players,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error comparando jugadores en juegos comunes',
    });
  }
};