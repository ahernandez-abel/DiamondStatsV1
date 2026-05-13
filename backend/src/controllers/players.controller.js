import { pool } from '../config/db.js';

export const getPlayers = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        players.*,
        teams.name AS team_name,
        teams.primary_color
      FROM players
      LEFT JOIN teams
      ON players.team_id = teams.id
      ORDER BY players.full_name ASC
    `);

    res.json({
      ok: true,
      players: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  try {

    const { id } = req.params

    const playerResult = await pool.query(
      `
      SELECT
        players.*,
        teams.name AS team_name,
        teams.primary_color
      FROM players
      LEFT JOIN teams
      ON players.team_id = teams.id
      WHERE players.id = $1
      `,
      [id]
    )

    if (playerResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Jugador no encontrado',
      })
    }

    const battingResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(ab), 0) AS ab,
        COALESCE(SUM(h), 0) AS hits,
        COALESCE(SUM(doubles), 0) AS doubles,
        COALESCE(SUM(triples), 0) AS triples,
        COALESCE(SUM(hr), 0) AS hr,
        COALESCE(SUM(r), 0) AS runs,
        COALESCE(SUM(rbi), 0) AS rbi,
        COALESCE(SUM(bb), 0) AS bb,
        COALESCE(SUM(so), 0) AS so,
        COALESCE(SUM(sb), 0) AS sb,
        COALESCE(SUM(cs), 0) AS cs,
        COALESCE(SUM(hbp), 0) AS hbp,
        COALESCE(SUM(sf), 0) AS sf,

        COALESCE(
          SUM(h) - SUM(doubles) - SUM(triples) - SUM(hr),
          0
        ) AS singles,

        COALESCE(
          (
            SUM(h) - SUM(doubles) - SUM(triples) - SUM(hr)
          )
          + (SUM(doubles) * 2)
          + (SUM(triples) * 3)
          + (SUM(hr) * 4),
          0
        ) AS tb,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ab), 0) = 0 THEN 0
            ELSE COALESCE(SUM(h), 0)::numeric / NULLIF(SUM(ab), 0)
          END,
          3
        ) AS avg,

        ROUND(
          CASE
            WHEN (
              COALESCE(SUM(ab), 0)
              + COALESCE(SUM(bb), 0)
              + COALESCE(SUM(hbp), 0)
              + COALESCE(SUM(sf), 0)
            ) = 0 THEN 0
            ELSE (
              COALESCE(SUM(h), 0)
              + COALESCE(SUM(bb), 0)
              + COALESCE(SUM(hbp), 0)
            )::numeric
            /
            NULLIF(
              (
                COALESCE(SUM(ab), 0)
                + COALESCE(SUM(bb), 0)
                + COALESCE(SUM(hbp), 0)
                + COALESCE(SUM(sf), 0)
              ),
              0
            )
          END,
          3
        ) AS obp,

        ROUND(
          CASE
            WHEN COALESCE(SUM(ab), 0) = 0 THEN 0
            ELSE (
              COALESCE(
                (
                  SUM(h) - SUM(doubles) - SUM(triples) - SUM(hr)
                )
                + (SUM(doubles) * 2)
                + (SUM(triples) * 3)
                + (SUM(hr) * 4),
                0
              )::numeric
              /
              NULLIF(SUM(ab), 0)
            )
          END,
          3
        ) AS slg

      FROM batting_stats
      WHERE player_id = $1
      `,
      [id]
    )

    const batting = battingResult.rows[0]

    batting.ops = (
      Number(batting.obp || 0) +
      Number(batting.slg || 0)
    ).toFixed(3)

    const pitchingResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(outs_recorded), 0) AS outs,

        ROUND(
          COALESCE(SUM(outs_recorded), 0)::numeric / 3,
          1
        ) AS ip,

        COALESCE(SUM(so), 0) AS strikeouts,
        COALESCE(SUM(bb), 0) AS walks,
        COALESCE(SUM(er), 0) AS earned_runs,
        COALESCE(SUM(r_allowed), 0) AS runs_allowed,
        COALESCE(SUM(hits_allowed), 0) AS hits_allowed,
        COALESCE(SUM(hr_allowed), 0) AS hr_allowed,
        COALESCE(SUM(hbp), 0) AS hbp,

        ROUND(
          CASE
            WHEN COALESCE(SUM(outs_recorded), 0) = 0 THEN 0
            ELSE (COALESCE(SUM(er), 0)::numeric * 21) / NULLIF(SUM(outs_recorded), 0)
          END,
          2
        ) AS era,

        ROUND(
          CASE
            WHEN COALESCE(SUM(outs_recorded), 0) = 0 THEN 0
            ELSE (
              (
                COALESCE(SUM(bb), 0)
                + COALESCE(SUM(hits_allowed), 0)
              )::numeric * 3
            )
            /
            NULLIF(SUM(outs_recorded), 0)
          END,
          2
        ) AS whip

      FROM pitching_stats
      WHERE player_id = $1
      `,
      [id]
    )

    const fieldingResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(putouts), 0) AS putouts,
        COALESCE(SUM(assists), 0) AS assists,
        COALESCE(SUM(errors), 0) AS errors,
        COALESCE(SUM(passed_balls), 0) AS passed_balls,

        COALESCE(
          SUM(putouts) + SUM(assists) + SUM(errors),
          0
        ) AS total_chances,

        ROUND(
          CASE
            WHEN (
              COALESCE(SUM(putouts), 0)
              + COALESCE(SUM(assists), 0)
              + COALESCE(SUM(errors), 0)
            ) = 0 THEN 0
            ELSE (
              COALESCE(SUM(putouts), 0)
              + COALESCE(SUM(assists), 0)
            )::numeric
            /
            NULLIF(
              (
                COALESCE(SUM(putouts), 0)
                + COALESCE(SUM(assists), 0)
                + COALESCE(SUM(errors), 0)
              ),
              0
            )
          END,
          3
        ) AS fielding_pct

      FROM fielding_stats
      WHERE player_id = $1
      `,
      [id]
    )

    res.json({
      ok: true,
      player: {
        ...playerResult.rows[0],
        batting,
        pitching: pitchingResult.rows[0],
        fielding: fieldingResult.rows[0],
      },
    })

  } catch (error) {
    next(error)
  }
}

export const createPlayer = async (req, res, next) => {
  try {
    const {
      full_name,
      nickname,
      photo_url,
      jersey_number,
      position,
      batting_hand,
      throwing_hand,
      team_id,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO players (
        full_name,
        nickname,
        photo_url,
        jersey_number,
        position,
        batting_hand,
        throwing_hand,
        team_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        full_name,
        nickname,
        photo_url,
        jersey_number,
        position,
        batting_hand,
        throwing_hand,
        team_id,
      ]
    );

    res.status(201).json({
      ok: true,
      player: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      nickname,
      photo_url,
      jersey_number,
      position,
      batting_hand,
      throwing_hand,
      team_id,
      is_active,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE players
      SET
        full_name = $1,
        nickname = $2,
        photo_url = $3,
        jersey_number = $4,
        position = $5,
        batting_hand = $6,
        throwing_hand = $7,
        team_id = $8,
        is_active = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
      `,
      [
        full_name,
        nickname,
        photo_url,
        jersey_number,
        position,
        batting_hand,
        throwing_hand,
        team_id,
        is_active,
        id,
      ]
    );

    res.json({
      ok: true,
      player: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM players
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      ok: true,
      message: 'Jugador eliminado',
    });
  } catch (error) {
    next(error);
  }
};