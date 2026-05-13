import {pool} from '../config/db.js'

export const getGames = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        g.*,
        ht.name AS home_team_name,
        at.name AS away_team_name
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      ORDER BY g.game_date DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error obteniendo juegos',
    })
  }
}

export const getGameById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT *
      FROM games
      WHERE id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Juego no encontrado',
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error obteniendo juego',
    })
  }
}

export const createGame = async (req, res) => {
  try {
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

    const result = await pool.query(
      `
      INSERT INTO games (
        home_team_id,
        away_team_id,
        game_date,
        game_time,
        venue,
        innings_played,
        status,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        home_team_id,
        away_team_id,
        game_date,
        game_time,
        venue,
        innings_played || 7,
        status || 'scheduled',
        notes || null,
      ]
    )

    res.status(201).json({
      message: 'Juego creado correctamente',
      game: result.rows[0],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error creando juego',
    })
  }
}

export const updateGame = async (req, res) => {
  try {
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
      RETURNING *
      `,
      [
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
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Juego no encontrado',
      })
    }

    res.json({
      message: 'Juego actualizado correctamente',
      game: result.rows[0],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error actualizando juego',
    })
  }
}

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      DELETE FROM games
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Juego no encontrado',
      })
    }

    res.json({
      message: 'Juego eliminado correctamente',
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error eliminando juego',
    })
  }
}

export const updateGameResult = async (req, res) => {
  try {
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
      RETURNING *
      `,
      [
        home_score,
        away_score,
        status || 'final',
        notes || null,
        id,
      ]
    )

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