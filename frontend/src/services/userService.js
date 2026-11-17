// src/services/userService.js
import api, { USE_MOCK } from './api.js';
import { MOCK_PROFILE } from './mockAdapter.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Flatten the backend profile shape:
 *   { healthProfile: { allergies, conditions, diet }, profileCompleted, language }
 * into the shape the frontend expects:
 *   { allergies, healthConditions, dietPreference, profileCompleted, language, name, email }
 */
function normalizeProfile(data) {
  const hp = data.healthProfile || {};
  return {
    // identity comes from auth /me; profile endpoint only returns health data
    // but we merge whatever is available
    name: data.name ?? null,
    email: data.email ?? null,
    language: data.language ?? 'en',
    profileCompleted: data.profileCompleted ?? false,
    allergies: hp.allergies ?? [],
    healthConditions: hp.conditions ?? [],
    dietPreference: hp.diet ?? '',
  };
}

/**
 * Map frontend form values to backend expected shape:
 *  { allergies, conditions, diet }
 */
function toBackendPayload({ allergies, healthConditions, dietPreference, ...rest }) {
  return {
    allergies: allergies ?? [],
    conditions: healthConditions ?? [],
    diet: dietPreference ?? '',
    // pass any other fields (name, age, gender) as-is
    ...rest,
  };
}

export const userService = {
  async getProfile() {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_PROFILE;
    }
    // Backend: GET /profile/getprofile  returns { healthProfile, profileCompleted, language }
    const { data } = await api.get('/profile/getprofile');
    return normalizeProfile(data);
  },

  async updateProfile(payload) {
    if (USE_MOCK) {
      await delay(600);
      return { ...MOCK_PROFILE, ...payload };
    }
    // Backend: POST /profile/updateprofile  expects { allergies, conditions, diet }
    const { data } = await api.post('/profile/updateprofile', toBackendPayload(payload));
    return normalizeProfile(data);
  },
};
