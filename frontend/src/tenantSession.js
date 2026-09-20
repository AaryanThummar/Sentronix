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
  
  // 1. Check if an active workspace ID is already stored in session
  let wsId = localStorage.getItem(WORKSPACE_KEY)
  if (wsId && wsId.trim()) {
    return wsId.trim()
  }

  // 2. If none exists, generate a unique sandbox ID for this operator
  const randomHex = Math.random().toString(36).substring(2, 8)
  const user = getUserProfile()
  if (user && user.email) {
    const prefix = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
    wsId = `ws-${prefix}-${randomHex}`
  } else {
    wsId = `ws-${randomHex}`
  }
  localStorage.setItem(WORKSPACE_KEY, wsId)
  return wsId
}

/**
 * Resets the workspace ID to a fresh clean workspace.
 */
export function resetWorkspaceId() {
  if (typeof window === 'undefined') return 'default-tenant'
  const randomHex = Math.random().toString(36).substring(2, 8)
  const user = getUserProfile()
  const newWsId = user && user.email 
    ? `ws-${user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}-${randomHex}`
    : `ws-${randomHex}`
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
