const TOKEN_KEYS = ['token', 'accessToken', 'jwt']
const ROLE_KEYS = ['role', 'roles', 'authorities', 'authority', 'scope', 'scp']

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

export function decodeJwtPayload(token) {
  try {
    const payload = token?.split('.')?.[1]
    return payload ? JSON.parse(decodeBase64Url(payload)) : null
  } catch {
    return null
  }
}

function normalizeRoleValue(value) {
  if (!value) return null

  if (Array.isArray(value)) {
    return value.map(normalizeRoleValue).find(Boolean) || null
  }

  if (typeof value === 'object') {
    return normalizeRoleValue(value.name || value.role || value.authority)
  }

  const role = String(value).replace(/^ROLE_/i, '').trim().toUpperCase()
  return role || null
}

function findValueByKeys(source, keys) {
  if (!source || typeof source !== 'object') return null

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key]
    }
  }

  return null
}

export function extractToken(authResponse) {
  const data = authResponse?.data || authResponse
  return (
    findValueByKeys(data, TOKEN_KEYS) ||
    findValueByKeys(data?.data, TOKEN_KEYS) ||
    findValueByKeys(data?.auth, TOKEN_KEYS) ||
    findValueByKeys(data?.user, TOKEN_KEYS) ||
    null
  )
}

export function extractUser(authResponse, token) {
  const data = authResponse?.data || authResponse || {}
  const jwtPayload = decodeJwtPayload(token) || {}
  const user = data.user || data.data?.user || data.profile || {}

  return {
    id: user.id || data.userId || jwtPayload.sub || jwtPayload.userId || null,
    name: user.name || user.username || data.name || data.username || jwtPayload.name || jwtPayload.sub || 'Library User',
    email: user.email || data.email || jwtPayload.email || null,
    role: extractRole(authResponse, token),
  }
}

export function extractRole(authResponse, token) {
  const data = authResponse?.data || authResponse || {}
  const jwtPayload = decodeJwtPayload(token) || {}

  return (
    normalizeRoleValue(findValueByKeys(data, ROLE_KEYS)) ||
    normalizeRoleValue(findValueByKeys(data?.data, ROLE_KEYS)) ||
    normalizeRoleValue(findValueByKeys(data?.user, ROLE_KEYS)) ||
    normalizeRoleValue(findValueByKeys(data?.data?.user, ROLE_KEYS)) ||
    normalizeRoleValue(findValueByKeys(jwtPayload, ROLE_KEYS)) ||
    'USER'
  )
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

export function saveAuthSession({ token, user, role }) {
  localStorage.setItem('token', token)
  localStorage.setItem('role', role)
  localStorage.setItem('user', JSON.stringify({ ...user, role }))

  if (user?.name) {
    localStorage.setItem('name', user.name)
  }
}

export function clearAuthSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('jwt')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  localStorage.removeItem('name')
}

export function getAuthSession() {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('jwt')

  if (!token || isTokenExpired(token)) {
    if (token) clearAuthSession()
    return { token: null, user: null, role: null, isAuthenticated: false }
  }

  let user

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  const role = normalizeRoleValue(user?.role || localStorage.getItem('role') || findValueByKeys(decodeJwtPayload(token), ROLE_KEYS))

  return {
    token,
    user,
    role,
    isAuthenticated: true,
  }
}

export function getRedirectPathForRole(role) {
  return normalizeRoleValue(role) === 'ADMIN' ? '/admin' : '/dashboard'
}

export function hasAllowedRole(role, allowedRoles = []) {
  if (!allowedRoles.length) return true
  const normalizedAllowedRoles = allowedRoles.map(normalizeRoleValue)
  return normalizedAllowedRoles.includes(normalizeRoleValue(role))
}
