import { apiRequest } from './client';

export const authApi = {
  login: (identifier, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getMe: (token) =>
    apiRequest('/auth/me', {
      method: 'GET',
      token
    })
};
