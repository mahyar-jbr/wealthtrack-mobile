export const API_BASE_URL = 'https://wealthtrack-backend-production.up.railway.app';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  USERS: {
    ME: '/api/users/me',
  },
    ASSETS: {
    BASE: '/api/assets',
    BY_ID: (id: string) => `/api/assets/${id}`,
  },
} as const;