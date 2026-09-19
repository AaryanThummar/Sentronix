// Workspace & Session Isolation Manager
// Generates and persists a unique workspace ID per browser session, ensuring multi-user isolation on cloud deployments.

const WORKSPACE_KEY = 'sentronix_workspace_id'
const AUTH_TOKEN_KEY = 'sentronix_auth_token'
const USER_PROFILE_KEY = 'sentronix_user_profile'

/**
 * Returns the current workspace ID, generating a random unique one if none exists.
 */
export function getWorkspaceId() {
  if (typeof window === 'undefined') return 'default-tenant'
  
  // If user is logged in, use their email or account ID as workspace
  const user = getUserProfile()
  if (user && user.email) {
    return `user-${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`
  }

  let wsId = localStorage.getItem(WORKSPACE_KEY)
  if (!wsId) {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6)
    wsId = `ws-${randomHex}`
    localStorage.setItem(WORKSPACE_KEY, wsId)
  }
  return wsId
}

/**
 * Resets the workspace ID to a fresh clean workspace.
 */
export function resetWorkspaceId() {
  if (typeof window === 'undefined') return 'default-tenant'
  const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6)
  const newWsId = `ws-${randomHex}`
  localStorage.setItem(WORKSPACE_KEY, newWsId)
  return newWsId
}

/**
 * Auth Token Management
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getUserProfile() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function setAuthSession(token, user) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_PROFILE_KEY)
}

/**
 * Injects X-Tenant-ID and optional Authorization Bearer token into headers.
 */
export function getTenantHeaders(customHeaders = {}) {
  const wsId = getWorkspaceId()
  const token = getAuthToken()
  
  const headers = {
    'X-Tenant-ID': wsId,
    ...customHeaders
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
