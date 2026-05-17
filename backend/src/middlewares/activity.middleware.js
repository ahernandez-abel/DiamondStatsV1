import {
  logTenantActivity,
  updateUserLastActivity,
} from '../helpers/activityLogger.js'

export const activityMiddleware = (
  activityType = 'request'
) => {
  return async (req, res, next) => {
    try {
      const user = req.user

      if (!user) {
        return next()
      }

      await updateUserLastActivity(user.id)

      if (user.tenant_id) {
        const ignoredRoutes = [
          '/api/auth/profile',
        ]

        const shouldIgnore = ignoredRoutes.some((route) =>
          req.originalUrl.includes(route)
        )

        if (!shouldIgnore) {
          await logTenantActivity({
            tenant_id: user.tenant_id,
            user_id: user.id,
            activity_type: activityType,

            description:
              `${req.method} ${req.originalUrl}`,

            entity_type: 'route',

            entity_id: null,

            ip_address: req.ip,

            user_agent:
              req.headers['user-agent'] || null,
          })
        }
      }

      next()
    } catch (error) {
      console.error(
        'Error en activityMiddleware:',
        error.message
      )

      next()
    }
  }
}