import { Navigate, useLocation } from 'react-router-dom'

import { getAuthSession, hasAllowedRole } from '../utils/auth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const { isAuthenticated, role } = getAuthSession()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!hasAllowedRole(role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
