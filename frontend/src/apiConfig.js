import { getTenantHeaders } from './tenantSession'

export const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : '';

/**
 * Standard fetch wrapper that automatically prefixes API_BASE_URL and injects X-Tenant-ID headers.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  const headers = getTenantHeaders(options.headers || {})
  return fetch(url, { ...options, headers })
}

export { getTenantHeaders }
export default API_BASE_URL;

