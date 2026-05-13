import {pool} from '../config/db.js'

export const getBattingLeaders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        players.id,
        players.full_name,
        players.photo_url,
        players.position,
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

      JOIN players
      ON players.id = bs.player_id

      LEFT JOIN teams
      ON teams.id = players.team_id

      GROUP BY
        players.id,
        players.full_name,
        players.photo_url,
        players.position,
        teams.name,
        teams.primary_color

      ORDER BY avg DESC, h DESC
    `)

    const leaders = result.rows.map((player) => ({
      ...player,
      ops: (
        Number(player.obp || 0) +
        Number(player.slg || 0)
      ).toFixed(3),
    }))

    res.json({
      ok: true,
      leaders,
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes ofensivos',
    })
  }
}

export const getPitchingLeaders = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        players.id,
        players.full_name,
        players.photo_url,

        SUM(ps.outs_recorded) AS outs_recorded,

        ROUND(
          SUM(ps.outs_recorded)::numeric / 3,
          1
        ) AS ip,

        SUM(ps.so) AS strikeouts,
        SUM(ps.bb) AS walks,

        SUM(ps.er) AS earned_runs,
        SUM(ps.r_allowed) AS runs_allowed,

        SUM(ps.hits_allowed) AS hits_allowed,
        SUM(ps.hr_allowed) AS hr_allowed,

        SUM(ps.hbp) AS hbp,

        ROUND(
          CASE
            WHEN SUM(ps.outs_recorded) = 0 THEN 0

            ELSE (
              SUM(ps.er)::numeric * 21
            ) / SUM(ps.outs_recorded)
          END,
          2
        ) AS era,

        ROUND(
          CASE
            WHEN SUM(ps.outs_recorded) = 0 THEN 0

            ELSE (
              (
                SUM(ps.bb)
                +
                SUM(ps.hits_allowed)
              )::numeric * 3
            ) / SUM(ps.outs_recorded)
          END,
          2
        ) AS whip,

        ROUND(
          CASE
            WHEN SUM(ps.outs_recorded) = 0 THEN 0

            ELSE (
              SUM(ps.so)::numeric * 21
            ) / SUM(ps.outs_recorded)
          END,
          2
        ) AS k_per_7,

        ROUND(
          CASE
            WHEN SUM(ps.outs_recorded) = 0 THEN 0

            ELSE (
              SUM(ps.bb)::numeric * 21
            ) / SUM(ps.outs_recorded)
          END,
          2
        ) AS bb_per_7,

        ROUND(
          CASE
            WHEN SUM(ps.outs_recorded) = 0 THEN 0

            ELSE (
              SUM(ps.hits_allowed)::numeric * 21
            ) / SUM(ps.outs_recorded)
          END,
          2
        ) AS h_per_7

      FROM pitching_stats ps

      JOIN players
      ON players.id = ps.player_id

      GROUP BY
        players.id,
        players.full_name,
        players.photo_url

      ORDER BY era ASC
    `)

    res.json({
      ok: true,
      leaders: result.rows,
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes de pitcheo',
    })
  }
}

export const getFieldingLeaders = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        players.id,
        players.full_name,
        players.photo_url,

        SUM(fs.putouts) AS putouts,
        SUM(fs.assists) AS assists,
        SUM(fs.errors) AS errors,

        SUM(fs.passed_balls) AS passed_balls,

        (
          SUM(fs.putouts)
          +
          SUM(fs.assists)
          +
          SUM(fs.errors)
        ) AS total_chances,

        ROUND(
          CASE
            WHEN (
              SUM(fs.putouts)
              +
              SUM(fs.assists)
              +
              SUM(fs.errors)
            ) = 0 THEN 0

            ELSE (
              (
                SUM(fs.putouts)
                +
                SUM(fs.assists)
              )::numeric
              /
              (
                SUM(fs.putouts)
                +
                SUM(fs.assists)
                +
                SUM(fs.errors)
              )
            )
          END,
          3
        ) AS fielding_pct,

        ROUND(
          (
            SUM(fs.putouts)
            +
            SUM(fs.assists)
          )::numeric,
          2
        ) AS range_factor

      FROM fielding_stats fs

      JOIN players
      ON players.id = fs.player_id

      GROUP BY
        players.id,
        players.full_name,
        players.photo_url

      ORDER BY fielding_pct DESC
    `)

    res.json({
      ok: true,
      leaders: result.rows,
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo líderes defensivos',
    })
  }
}

export const getMonthlyMVP = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH latest_month AS (
        SELECT
          EXTRACT(MONTH FROM MAX(g.game_date)) AS month,
          EXTRACT(YEAR FROM MAX(g.game_date)) AS year
        FROM batting_stats bs
        JOIN games g ON g.id = bs.game_id
      )

      SELECT
        players.id,
        players.full_name,
        players.photo_url,

        SUM(bs.ab) AS ab,
        SUM(bs.h) AS hits,
        SUM(bs.doubles) AS doubles,
        SUM(bs.triples) AS triples,
        SUM(bs.hr) AS hr,
        SUM(bs.rbi) AS rbi,
        SUM(bs.r) AS runs,
        SUM(bs.bb) AS bb,
        SUM(bs.sb) AS sb,

        ROUND(
          CASE
            WHEN SUM(bs.ab) = 0 THEN 0
            ELSE SUM(bs.h)::numeric / SUM(bs.ab)
          END,
          3
        ) AS avg,

        ROUND(
          (
            (SUM(bs.hr) * 4)
            +
            (SUM(bs.triples) * 3)
            +
            (SUM(bs.doubles) * 2)
            +
            (SUM(bs.h) * 1)
            +
            (SUM(bs.rbi) * 1)
            +
            (SUM(bs.r) * 1)
            +
            (SUM(bs.sb) * 1)
            +
            (SUM(bs.bb) * 0.5)
          ),
          2
        ) AS mvp_points

      FROM batting_stats bs

      JOIN players
      ON players.id = bs.player_id

      JOIN games
      ON games.id = bs.game_id

      CROSS JOIN latest_month lm

      WHERE
        EXTRACT(MONTH FROM games.game_date) = lm.month
        AND
        EXTRACT(YEAR FROM games.game_date) = lm.year

      GROUP BY
        players.id,
        players.full_name,
        players.photo_url

      ORDER BY mvp_points DESC

      LIMIT 1
    `)

    res.json({
      ok: true,
      mvp: result.rows[0] || null,
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error calculando MVP mensual',
    })
  }
}