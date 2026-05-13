import {pool} from '../config/db.js'

export const getGameStats = async (req, res) => {
  try {
    const { gameId } = req.params

    const batting = await pool.query(
      `
      SELECT bs.*, p.full_name, p.jersey_number, p.position
      FROM batting_stats bs
      JOIN players p ON p.id = bs.player_id
      WHERE bs.game_id = $1
      ORDER BY p.full_name ASC
      `,
      [gameId]
    )

    const fielding = await pool.query(
      `
      SELECT fs.*, p.full_name, p.jersey_number
      FROM fielding_stats fs
      JOIN players p ON p.id = fs.player_id
      WHERE fs.game_id = $1
      ORDER BY p.full_name ASC
      `,
      [gameId]
    )

    const pitching = await pool.query(
      `
      SELECT ps.*, p.full_name, p.jersey_number
      FROM pitching_stats ps
      JOIN players p ON p.id = ps.player_id
      WHERE ps.game_id = $1
      ORDER BY p.full_name ASC
      `,
      [gameId]
    )

    res.json({
      ok: true,
      batting: batting.rows,
      fielding: fielding.rows,
      pitching: pitching.rows,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo estadísticas del juego',
    })
  }
}

export const savePlayerGameStats = async (req, res) => {
  const client = await pool.connect()

  try {
    const { gameId } = req.params

    const {
      player_id,
      team_id,
      batting,
      fielding,
      pitching,
    } = req.body

    await client.query('BEGIN')

    if (batting) {
      await client.query(
        `
        INSERT INTO batting_stats (
          player_id, game_id, team_id,
          ab, h, doubles, triples, hr, rbi, r,
          sb, cs, so, bb, hbp, sf, sac
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17
        )
        ON CONFLICT (player_id, game_id)
        DO UPDATE SET
          ab = EXCLUDED.ab,
          h = EXCLUDED.h,
          doubles = EXCLUDED.doubles,
          triples = EXCLUDED.triples,
          hr = EXCLUDED.hr,
          rbi = EXCLUDED.rbi,
          r = EXCLUDED.r,
          sb = EXCLUDED.sb,
          cs = EXCLUDED.cs,
          so = EXCLUDED.so,
          bb = EXCLUDED.bb,
          hbp = EXCLUDED.hbp,
          sf = EXCLUDED.sf,
          sac = EXCLUDED.sac,
          updated_at = NOW()
        `,
        [
          player_id,
          gameId,
          team_id,
          batting.ab || 0,
          batting.h || 0,
          batting.doubles || 0,
          batting.triples || 0,
          batting.hr || 0,
          batting.rbi || 0,
          batting.r || 0,
          batting.sb || 0,
          batting.cs || 0,
          batting.so || 0,
          batting.bb || 0,
          batting.hbp || 0,
          batting.sf || 0,
          batting.sac || 0,
        ]
      )
    }

    if (fielding) {
      await client.query(
        `
        INSERT INTO fielding_stats (
          player_id, game_id, team_id,
          position, putouts, assists, errors, passed_balls
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (player_id, game_id)
        DO UPDATE SET
          position = EXCLUDED.position,
          putouts = EXCLUDED.putouts,
          assists = EXCLUDED.assists,
          errors = EXCLUDED.errors,
          passed_balls = EXCLUDED.passed_balls,
          updated_at = NOW()
        `,
        [
          player_id,
          gameId,
          team_id,
          fielding.position || null,
          fielding.putouts || 0,
          fielding.assists || 0,
          fielding.errors || 0,
          fielding.passed_balls || 0,
        ]
      )
    }

    if (pitching?.pitched) {
      await client.query(
        `
        INSERT INTO pitching_stats (
          player_id, game_id, team_id,
          outs_recorded, hits_allowed, er, r_allowed,
          bb, so, hr_allowed, hbp, result
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (player_id, game_id)
        DO UPDATE SET
          outs_recorded = EXCLUDED.outs_recorded,
          hits_allowed = EXCLUDED.hits_allowed,
          er = EXCLUDED.er,
          r_allowed = EXCLUDED.r_allowed,
          bb = EXCLUDED.bb,
          so = EXCLUDED.so,
          hr_allowed = EXCLUDED.hr_allowed,
          hbp = EXCLUDED.hbp,
          result = EXCLUDED.result,
          updated_at = NOW()
        `,
        [
          player_id,
          gameId,
          team_id,
          pitching.outs_recorded || 0,
          pitching.hits_allowed || 0,
          pitching.er || 0,
          pitching.r_allowed || 0,
          pitching.bb || 0,
          pitching.so || 0,
          pitching.hr_allowed || 0,
          pitching.hbp || 0,
          pitching.result || null,
        ]
      )
    }

    await client.query('COMMIT')

    res.json({
      ok: true,
      message: 'Estadísticas guardadas correctamente',
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.log(error)

    res.status(500).json({
      ok: false,
      message: 'Error guardando estadísticas',
    })
  } finally {
    client.release()
  }
}