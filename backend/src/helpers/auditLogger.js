import { pool } from '../config/db.js';

export const logAudit = async ({
  tenant_id = null,
  user_id = null,
  action,
  module,
  entity_type = null,
  entity_id = null,
  old_data = null,
  new_data = null,
  description = null,
  ip_address = null,
  user_agent = null,
}) => {
  try {
    if (!action || !module) return;

    await pool.query(
      `
      INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        module,
        entity_type,
        entity_id,
        old_data,
        new_data,
        description,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        tenant_id,
        user_id,
        action,
        module,
        entity_type,
        entity_id,
        old_data ? JSON.stringify(old_data) : null,
        new_data ? JSON.stringify(new_data) : null,
        description,
        ip_address,
        user_agent,
      ]
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error.message);
  }
};