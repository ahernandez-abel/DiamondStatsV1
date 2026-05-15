export const tenantMiddleware = (req, res, next) => {
  try {
    if (!req.user || !req.user.tenant_id) {
      return res.status(401).json({
        ok: false,
        message: 'Tenant no encontrado en el usuario',
      });
    }

    req.tenantId = req.user.tenant_id;

    next();
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error validando tenant',
    });
  }
};