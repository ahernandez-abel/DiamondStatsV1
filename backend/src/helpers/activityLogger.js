import { pool } from '../config/db.js';

export const logTenantActivity = async ({
  tenant_id,
  user_id = null,
  activity_type,
  description = null,
  entity_type = null,
  entity_id = null,
  ip_address = null,
  user_agent = null,
}) => {
  try {
    if (!tenant_id || !activity_type) return;

    await pool.query(
      `
      INSERT INTO tenant_activity_logs (
        tenant_id,
        user_id,
        activity_type,
        description,
        entity_type,
        entity_id,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        tenant_id,
        user_id,
        activity_type,
        description,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
      ]
    );
  } catch (error) {
    console.error('Error registrando actividad del tenant:', error.message);
  }
};

export const updateUserLastActivity = async (user_id) => {
  try {
    if (!user_id) return;

    await pool.query(
      `
      UPDATE users
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user_id]
    );
  } catch (error) {
    console.error('Error actualizando última actividad:', error.message);
  }
};