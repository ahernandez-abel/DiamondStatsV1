import { pool } from '../config/db.js';

export const getTeams = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        t.*,

        COALESCE(
          COUNT(g.id) FILTER (
            WHERE
              g.status = 'final'
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
      ON g.home_team_id = t.id
      OR g.away_team_id = t.id

      GROUP BY t.id

      ORDER BY t.name ASC
    `)

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
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM teams
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Equipo no encontrado',
      });
    }

    res.json({
      ok: true,
      team: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const {
      name,
      short_name,
      logo_url,
      primary_color,
      secondary_color,
      manager_name,
      city,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO teams (
        name,
        short_name,
        logo_url,
        primary_color,
        secondary_color,
        manager_name,
        city
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
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
      ]
    );

    res.status(201).json({
      ok: true,
      team: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      name,
      short_name,
      logo_url,
      primary_color,
      secondary_color,
      manager_name,
      city,
    } = req.body;

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
      ]
    );

    res.json({
      ok: true,
      team: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM teams
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      ok: true,
      message: 'Equipo eliminado',
    });
  } catch (error) {
    next(error);
  }
};