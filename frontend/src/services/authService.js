import api from './api'
import { extractRole, extractToken, extractUser, saveAuthSession } from '../utils/auth'

export async function login(credentials) {
  const response = await api.post('/auth/login', {
    usernameOrEmail: credentials.usernameOrEmail,
    password: credentials.password,
  })

  const token = extractToken(response.data)

  if (!token) {
    throw new Error('Login succeeded, but no access token was returned.')
  }

  const role = extractRole(response.data, token)
  const user = extractUser(response.data, token)

  saveAuthSession({ token, user, role })

  return { token, user, role }
}

export async function register(details) {
  const username = details.username?.trim()
  const response = await api.post('/auth/register', {
    username,
    email: details.email,
    password: details.password,
    fullName: details.fullName,
    role: details.role,
  })

  const session = await login({
    usernameOrEmail: username || details.email,
    password: details.password,
  })

  return { user: response.data, session }
}

export default {
  login,
  register,
}
