// Dynamic API base URL: uses http://localhost:8000 when running Vite dev server locally on :5173,
// and relative path '' when running in production (Render, Docker, or Standalone port 8000).
export const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : '';

export default API_BASE_URL;
