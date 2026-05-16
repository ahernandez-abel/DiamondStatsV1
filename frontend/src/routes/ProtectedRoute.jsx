import { Navigate } from 'react-router-dom'

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {

  const token = localStorage.getItem('token')

  const userData = localStorage.getItem('user')

  if (!token || !userData) {
    return <Navigate to="/login" replace />
  }

  let user = null

  try {
    user = JSON.parse(userData)
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return <Navigate to="/login" replace />
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {

    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin" replace />
    }

    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute