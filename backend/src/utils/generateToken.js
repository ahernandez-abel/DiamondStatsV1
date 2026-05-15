import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tenant_id: user.tenant_id,
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};