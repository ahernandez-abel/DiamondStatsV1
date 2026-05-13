import {pool} from '../config/db.js'

export const getBattingLeaders = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        players.id,
        players.full_name,
        players.photo_url,

        SUM(bs.ab) AS ab,
        SUM(bs.h) AS h,

        SUM(bs.doubles) AS doubles,
        SUM(bs.triples) AS triples,
        SUM(bs.hr) AS hr,

        (
          SUM(bs.h)
          -
          SUM(bs.doubles)
          -
          SUM(bs.triples)
          -
          SUM(bs.hr)
        ) AS singles,

        SUM(bs.rbi) AS rbi,
        SUM(bs.r) AS runs,

        SUM(bs.bb) AS bb,
        SUM(bs.so) AS so,

        SUM(bs.sb) AS sb,
        SUM(bs.cs) AS cs,

        SUM(bs.hbp) AS hbp,
        SUM(bs.sf) AS sf,

        (
          (
            SUM(bs.h)
            -
            SUM(bs.doubles)
            -
            SUM(bs.triples)
            -
            SUM(bs.hr)
          )
          +
          (SUM(bs.doubles) * 2)
          +
          (SUM(bs.triples) * 3)
          +
          (SUM(bs.hr) * 4)
        ) AS tb,

        ROUND(
          CASE
            WHEN SUM(bs.ab) = 0 THEN 0
            ELSE SUM(bs.h)::numeric / SUM(bs.ab)
          END,
          3
        ) AS avg,

        ROUND(
          CASE
            WHEN (
              SUM(bs.ab)
              +
              SUM(bs.bb)
              +
              SUM(bs.hbp)
              +
              SUM(bs.sf)
            ) = 0 THEN 0

            ELSE (
              (
                SUM(bs.h)
                +
                SUM(bs.bb)
                +
                SUM(bs.hbp)
              )::numeric
              /
              (
                SUM(bs.ab)
                +
                SUM(bs.bb)
                +
                SUM(bs.hbp)
                +
                SUM(bs.sf)
              )
            )
          END,
          3
        ) AS obp,

        ROUND(
          CASE
            WHEN SUM(bs.ab) = 0 THEN 0

            ELSE (
              (
                (
                  SUM(bs.h)
                  -
                  SUM(bs.doubles)
                  -
                  SUM(bs.triples)
                  -
                  SUM(bs.hr)
                )
                +
                (SUM(bs.doubles) * 2)
                +
                (SUM(bs.triples) * 3)
                +
                (SUM(bs.hr) * 4)
              )::numeric
              /
              SUM(bs.ab)
            )
          END,
          3
        ) AS slg,

        ROUND(
          (
            CASE
              WHEN (
                SUM(bs.ab)
                +
                SUM(bs.bb)
                +
                SUM(bs.hbp)
                +
                SUM(bs.sf)
              ) = 0 THEN 0

              ELSE (
                (
                  SUM(bs.h)
                  +
                  SUM(bs.bb)
                  +
                  SUM(bs.hbp)
                )::numeric
                /
                (
                  SUM(bs.ab)
                  +
                  SUM(bs.bb)
                  +
                  SUM(bs.hbp)
                  +
                  SUM(bs.sf)
                )
              )
            END
          )
          +
          (
            CASE
              WHEN SUM(bs.ab) = 0 THEN 0

              ELSE (
                (
                  (
                    SUM(bs.h)
                    -
                    SUM(bs.doubles)
                    -
                    SUM(bs.triples)
                    -
                    SUM(bs.hr)
                  )
                  +
                  (SUM(bs.doubles) * 2)
                  +
                  (SUM(bs.triples) * 3)
                  +
                  (SUM(bs.hr) * 4)
                )::numeric
                /
                SUM(bs.ab)
              )
            END
          ),
          3
        ) AS ops

      FROM batting_stats bs

      JOIN players
      ON players.id = bs.player_id

      GROUP BY
        players.id,
        players.full_name,
        players.photo_url

      ORDER BY ops DESC
    `)

    res.json({
      ok: true,
      leaders: result.rows,
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