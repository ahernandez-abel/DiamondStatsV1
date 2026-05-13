import { pool } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      AND password = $2
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

    const token = generateToken(user);

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
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
      SELECT id, username, email, role
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    res.json({
      ok: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};