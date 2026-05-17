import { pool } from '../config/db.js';

export const createSystemAlert = async ({
  tenant_id,
  alert_type,
  severity = 'info',
  title,
  message,
}) => {
  try {
    if (!tenant_id || !alert_type || !title || !message) return;

    const result = await pool.query(
      `
      INSERT INTO system_alerts (
        tenant_id,
        alert_type,
        severity,
        title,
        message
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tenant_id, alert_type)
      WHERE is_resolved = false
      DO UPDATE SET
        severity = EXCLUDED.severity,
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        is_read = false,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [tenant_id, alert_type, severity, title, message]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creando alerta del sistema:', error.message);
  }
};

export const markAlertAsRead = async (alert_id) => {
  try {
    if (!alert_id) return;

    const result = await pool.query(
      `
      UPDATE system_alerts
      SET is_read = true
      WHERE id = $1
      RETURNING *
      `,
      [alert_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error marcando alerta como leída:', error.message);
  }
};

export const resolveSystemAlert = async (alert_id) => {
  try {
    if (!alert_id) return;

    const result = await pool.query(
      `
      UPDATE system_alerts
      SET 
        is_resolved = true,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [alert_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error resolviendo alerta:', error.message);
  }
};

export const createFreeLimitAlert = async ({
  tenant_id,
  limit_type,
  current_value,
  max_value,
  tenant_name = 'Este equipo',
}) => {
  try {
    if (!tenant_id || !limit_type || max_value === undefined) return;

    if (Number(current_value) < Number(max_value)) return;

    return await createSystemAlert({
      tenant_id,
      alert_type: `free_limit_${limit_type}`,
      severity: 'warning',
      title: `${tenant_name} llegó al límite Free`,
      message: `${tenant_name} llegó a ${current_value}/${max_value} en ${limit_type}. Puede ser candidato para venderle el plan Pro.`,
    });
  } catch (error) {
    console.error('Error creando alerta de límite Free:', error.message);
  }
};

export const createInactiveTenantAlert = async ({
  tenant_id,
  tenant_name = 'Este equipo',
  days_inactive = 30,
}) => {
  try {
    if (!tenant_id) return;

    return await createSystemAlert({
      tenant_id,
      alert_type: 'tenant_inactive',
      severity: 'info',
      title: `${tenant_name} lleva ${days_inactive} días sin actividad`,
      message: `${tenant_name} no ha tenido actividad reciente. Conviene revisar si necesita seguimiento.`,
    });
  } catch (error) {
    console.error('Error creando alerta de tenant inactivo:', error.message);
  }
};

export const createPaymentDueAlert = async ({
  tenant_id,
  tenant_name = 'Este equipo',
  due_date,
}) => {
  try {
    if (!tenant_id) return;

    return await createSystemAlert({
      tenant_id,
      alert_type: 'payment_due_soon',
      severity: 'warning',
      title: `${tenant_name} está próximo a vencer`,
      message: `El pago de ${tenant_name} está próximo a vencer${due_date ? ` el ${due_date}` : ''}.`,
    });
  } catch (error) {
    console.error('Error creando alerta de pago próximo:', error.message);
  }
};

export const createPaymentExpiredAlert = async ({
  tenant_id,
  tenant_name = 'Este equipo',
}) => {
  try {
    if (!tenant_id) return;

    return await createSystemAlert({
      tenant_id,
      alert_type: 'payment_expired',
      severity: 'danger',
      title: `${tenant_name} tiene pago vencido`,
      message: `${tenant_name} tiene un pago vencido. Revisa su suscripción desde el panel del superadmin.`,
    });
  } catch (error) {
    console.error('Error creando alerta de pago vencido:', error.message);
  }
};