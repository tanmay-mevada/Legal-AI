/**
 * Application configuration
 */

// API Configuration
export const API_CONFIG = {
  // Use the deployed Cloud Run service URL
  BASE_URL: 'https://legal-ai-backend-63563783552.us-central1.run.app',
  
  // API endpoints
  ENDPOINTS: {
    ACTIVITY: '/api/activity',
    DOCUMENTS: '/api/documents',
    ADMIN: '/api/admin',
    UPLOAD: '/upload',
    PROCESS: '/process'
  }
} as const

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Pre-built API URLs for common endpoints
export const API_URLS = {
  TRACK_LOGIN: buildApiUrl('/api/activity/track-login'),
  DOCUMENTS: buildApiUrl('/api/documents/'),
  PROCESS_DOCUMENT: (docId: string) => buildApiUrl(`/api/documents/${docId}/process`),
  GET_DOCUMENT: (docId: string) => buildApiUrl(`/api/documents/${docId}`),
  ADMIN_TEST: buildApiUrl('/api/admin/test'),
  ADMIN_USERS: buildApiUrl('/api/admin/users'),
} as const