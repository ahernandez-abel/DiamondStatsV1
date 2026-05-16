import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: 'Token requerido',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        ok: false,
        message: 'Token incompleto',
      });
    }

    if (decoded.role !== 'superadmin' && !decoded.tenant_id) {
      return res.status(401).json({
        ok: false,
        message: 'Token sin tenant asignado',
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      tenant_id: decoded.tenant_id || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido',
    });
  }
};