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

    const teams = await pool.query(
      `
      SELECT *
      FROM teams
      WHERE tenant_id = $1
      ORDER BY name ASC
      `,
      [tenant.id]
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
      [tenant.id]
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
      [tenant.id]
    );

    res.json({
      ok: true,
      tenant,
      teams: teams.rows,
      players: players.rows,
      games: games.rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: 'Error cargando página pública',
    });
  }
};