import { pool } from '../config/db.js';

export const getPlans = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM plans
      ORDER BY price_monthly ASC
    `);

    res.json({
      ok: true,
      plans: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description = '',
      price_monthly = 0,
      currency = 'DOP',
      max_players = null,
      max_games = null,
      max_rival_teams = null,
      allow_custom_logo = false,
      allow_advanced_stats = false,
      allow_player_compare = false,
      is_public = true,
      is_active = true,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre y el slug del plan son obligatorios',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO plans (
        name,
        slug,
        description,
        price_monthly,
        currency,
        max_players,
        max_games,
        max_rival_teams,
        allow_custom_logo,
        allow_advanced_stats,
        allow_player_compare,
        is_public,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13
      )
      RETURNING *
      `,
      [
        name,
        slug,
        description,
        price_monthly,
        currency,
        max_players,
        max_games,
        max_rival_teams,
        allow_custom_logo,
        allow_advanced_stats,
        allow_player_compare,
        is_public,
        is_active,
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Plan creado correctamente',
      plan: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un plan con ese nombre o slug',
      });
    }

    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    const {
      name,
      slug,
      description,
      price_monthly,
      currency,
      max_players,
      max_games,
      max_rival_teams,
      allow_custom_logo,
      allow_advanced_stats,
      allow_player_compare,
      is_public,
      is_active,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE plans
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        price_monthly = COALESCE($4, price_monthly),
        currency = COALESCE($5, currency),
        max_players = $6,
        max_games = $7,
        max_rival_teams = $8,
        allow_custom_logo = COALESCE($9, allow_custom_logo),
        allow_advanced_stats = COALESCE($10, allow_advanced_stats),
        allow_player_compare = COALESCE($11, allow_player_compare),
        is_public = COALESCE($12, is_public),
        is_active = COALESCE($13, is_active),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
      `,
      [
        name,
        slug,
        description,
        price_monthly,
        currency,
        max_players,
        max_games,
        max_rival_teams,
        allow_custom_logo,
        allow_advanced_stats,
        allow_player_compare,
        is_public,
        is_active,
        planId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Plan no encontrado',
      });
    }

    res.json({
      ok: true,
      message: 'Plan actualizado correctamente',
      plan: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingTenants = async (req, res, next) => {
  try {
    const result = await pool.query(`
      WITH latest_subscription AS (
        SELECT DISTINCT ON (tenant_id)
          *
        FROM tenant_subscriptions
        ORDER BY tenant_id, created_at DESC, id DESC
      ),
      payment_summary AS (
        SELECT
          tenant_id,
          COALESCE(SUM(amount), 0)::numeric AS total_paid,
          MAX(paid_at) AS last_payment_at
        FROM payments
        GROUP BY tenant_id
      )
      SELECT
        tenants.id,
        tenants.name,
        tenants.slug,
        tenants.status,
        tenants.plan AS legacy_plan,
        plans.id AS plan_id,
        plans.name AS plan_name,
        plans.slug AS plan_slug,
        plans.price_monthly,
        plans.currency,
        latest_subscription.status AS subscription_status,
        latest_subscription.started_at,
        latest_subscription.expires_at,
        COALESCE(payment_summary.total_paid, 0)::numeric AS total_paid,
        payment_summary.last_payment_at
      FROM tenants
      LEFT JOIN latest_subscription
        ON latest_subscription.tenant_id = tenants.id
      LEFT JOIN plans
        ON plans.id = latest_subscription.plan_id
      LEFT JOIN payment_summary
        ON payment_summary.tenant_id = tenants.id
      ORDER BY tenants.created_at DESC
    `);

    res.json({
      ok: true,
      tenants: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const changeTenantPlan = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { tenantId } = req.params;
    const {
      plan_id,
      expires_at = null,
      status = 'active',
      notes = '',
    } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        ok: false,
        message: 'El plan es obligatorio',
      });
    }

    await client.query('BEGIN');

    const planResult = await client.query(
      `
      SELECT *
      FROM plans
      WHERE id = $1
      LIMIT 1
      `,
      [plan_id]
    );

    const plan = planResult.rows[0];

    if (!plan) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        ok: false,
        message: 'Plan no encontrado',
      });
    }

    await client.query(
      `
      UPDATE tenant_subscriptions
      SET status = 'inactive',
          updated_at = NOW()
      WHERE tenant_id = $1
      AND status = 'active'
      `,
      [tenantId]
    );

    const subscriptionResult = await client.query(
      `
      INSERT INTO tenant_subscriptions (
        tenant_id,
        plan_id,
        status,
        started_at,
        expires_at,
        notes
      )
      VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING *
      `,
      [
        tenantId,
        plan_id,
        status,
        expires_at,
        notes,
      ]
    );

    await client.query(
      `
      UPDATE tenants
      SET plan = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [plan.slug, tenantId]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      message: 'Plan del tenant actualizado correctamente',
      subscription: subscriptionResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const registerManualPayment = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { tenantId } = req.params;

    const {
      plan_id,
      amount,
      currency = 'DOP',
      payment_method,
      status = 'paid',
      paid_at = null,
      period_start = null,
      period_end = null,
      reference = '',
      notes = '',
      update_subscription = true,
    } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({
        ok: false,
        message: 'El monto y el método de pago son obligatorios',
      });
    }

    await client.query('BEGIN');

    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        tenant_id,
        plan_id,
        amount,
        currency,
        payment_method,
        status,
        paid_at,
        period_start,
        period_end,
        reference,
        notes,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, COALESCE($7, NOW()),
        $8, $9, $10, $11, $12
      )
      RETURNING *
      `,
      [
        tenantId,
        plan_id,
        amount,
        currency,
        payment_method,
        status,
        paid_at,
        period_start,
        period_end,
        reference,
        notes,
        req.user.id,
      ]
    );

    let subscription = null;

    if (update_subscription && plan_id) {
      const planResult = await client.query(
        `
        SELECT *
        FROM plans
        WHERE id = $1
        LIMIT 1
        `,
        [plan_id]
      );

      const plan = planResult.rows[0];

      if (plan) {
        await client.query(
          `
          UPDATE tenant_subscriptions
          SET status = 'inactive',
              updated_at = NOW()
          WHERE tenant_id = $1
          AND status = 'active'
          `,
          [tenantId]
        );

        const subscriptionResult = await client.query(
          `
          INSERT INTO tenant_subscriptions (
            tenant_id,
            plan_id,
            status,
            started_at,
            expires_at,
            notes
          )
          VALUES ($1, $2, 'active', COALESCE($3, NOW()), $4, $5)
          RETURNING *
          `,
          [
            tenantId,
            plan_id,
            paid_at,
            period_end,
            notes || 'Actualizado desde pago manual',
          ]
        );

        subscription = subscriptionResult.rows[0];

        await client.query(
          `
          UPDATE tenants
          SET plan = $1,
              status = 'active',
              updated_at = NOW()
          WHERE id = $2
          `,
          [plan.slug, tenantId]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      ok: true,
      message: 'Pago registrado correctamente',
      payment: paymentResult.rows[0],
      subscription,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getTenantPayments = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const result = await pool.query(
      `
      SELECT
        payments.*,
        plans.name AS plan_name,
        plans.slug AS plan_slug,
        users.username AS created_by_name
      FROM payments
      LEFT JOIN plans ON plans.id = payments.plan_id
      LEFT JOIN users ON users.id = payments.created_by
      WHERE payments.tenant_id = $1
      ORDER BY payments.paid_at DESC
      `,
      [tenantId]
    );

    res.json({
      ok: true,
      payments: result.rows,
    });
  } catch (error) {
    next(error);
  }
};