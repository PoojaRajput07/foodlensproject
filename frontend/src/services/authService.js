// src/services/authService.js
import api, { USE_MOCK } from './api.js';
import { MOCK_USER } from './mockAdapter.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async register({ name, email, password }) {
    if (USE_MOCK) {
      await delay(800);
      const token = 'mock-jwt-token-' + Date.now();
      return { token, user: { ...MOCK_USER, name, email } };
    }
    // Backend route: POST /auth/signup  returns { accessToken, user }
    const { data } = await api.post('/auth/signup', { name, email, password });
    return {
      token: data.accessToken,
      user: data.user,
    };
  },

  async login({ email, password }) {
    if (USE_MOCK) {
      await delay(700);
      if (email && password) {
        const token = 'mock-jwt-token-' + Date.now();
        return { token, user: MOCK_USER };
      }
      throw { message: 'Invalid credentials' };
    }
    // Backend route: POST /auth/login  returns { accessToken, user }
    const { data } = await api.post('/auth/login', { email, password });
    return {
      token: data.accessToken,
      user: data.user,
    };
  },

  async logout() {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    await api.post('/auth/logout');
  },

  async getMe() {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_USER;
    }
    // Backend route: GET /auth/me  returns { success, user }
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};
