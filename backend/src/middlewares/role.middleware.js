export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

export const onlySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      ok: false,
      message: 'Acceso exclusivo para superadmin',
    });
  }

  next();
};

export const onlyTenantAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      ok: false,
      message: 'Acceso exclusivo para admin de equipo',
    });
  }

  if (!req.user.tenant_id) {
    return res.status(403).json({
      ok: false,
      message: 'Admin sin tenant asignado',
    });
  }

  next();
};