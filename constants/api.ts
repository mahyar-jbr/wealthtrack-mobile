export const API_BASE_URL = 'http://10.24.167.207:3000';

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