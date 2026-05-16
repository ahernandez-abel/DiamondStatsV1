import { pool } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT
        users.id,
        users.username,
        users.email,
        users.password,
        users.role,
        users.is_active,
        users.tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status
      FROM users
      LEFT JOIN tenants ON tenants.id = users.tenant_id
      WHERE users.email = $1
      AND users.password = $2
      LIMIT 1
      `,
      [email, password]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo',
      });
    }

    if (user.role !== 'superadmin') {
      if (!user.tenant_id) {
        return res.status(403).json({
          ok: false,
          message: 'Este usuario no tiene equipo asignado',
        });
      }

      if (user.tenant_status !== 'active') {
        return res.status(403).json({
          ok: false,
          message: 'El equipo no tiene acceso activo',
        });
      }
    }

    const token = generateToken(user);

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tenant_slug: user.tenant_slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT
        users.id,
        users.username,
        users.email,
        users.role,
        users.is_active,
        users.tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status
      FROM users
      LEFT JOIN tenants ON tenants.id = users.tenant_id
      WHERE users.id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo',
      });
    }

    if (user.role !== 'superadmin') {
      if (user.tenant_id !== req.user.tenant_id) {
        return res.status(403).json({
          ok: false,
          message: 'No autorizado para este tenant',
        });
      }

      if (user.tenant_status !== 'active') {
        return res.status(403).json({
          ok: false,
          message: 'El equipo no tiene acceso activo',
        });
      }
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tenant_slug: user.tenant_slug,
        tenant_status: user.tenant_status,
      },
    });
  } catch (error) {
    next(error);
  }
};