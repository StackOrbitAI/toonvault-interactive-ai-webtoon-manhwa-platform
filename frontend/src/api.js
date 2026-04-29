import axios from 'axios';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const api = {
  // Auth
  getMe: () => axios.get('/api/auth/me', authHeaders()),

  // User profile & plan
  getProfile: () => axios.get('/api/users/me', authHeaders()),
  updateProfile: (data) => axios.patch('/api/users/me', data, authHeaders()),
  updatePlan: (plan) => axios.post('/api/users/update-plan', { plan }, authHeaders()),

  // My Stories (CRUD)
  getMyStories: () => axios.get('/api/users/my-stories', authHeaders()),
  createStory: (data) => axios.post('/api/users/my-stories', data, authHeaders()),
  updateStory: (id, data) => axios.patch(`/api/users/my-stories/${id}`, data, authHeaders()),
  deleteStory: (id) => axios.delete(`/api/users/my-stories/${id}`, authHeaders()),

  // Public stories (for reading list)
  getAllStories: () => axios.get('/api/stories'),

  // AI Generation
  generateStory: (data) => axios.post('/api/stories/generate', data, authHeaders()),
  generateArticle: (data) => axios.post('/api/stories/generate-article', data, authHeaders()),

  // Admin
  getAdminStats: () => axios.get('/api/admin/stats', authHeaders()),
  getAdminUsers: () => axios.get('/api/admin/users', authHeaders()),
  getAdminStories: () => axios.get('/api/admin/stories', authHeaders()),
  getAdminTransactions: () => axios.get('/api/admin/transactions', authHeaders()),
  getAdminSettings: () => axios.get('/api/admin/settings', authHeaders()),
  updateAdminSetting: (key, value) => axios.post('/api/admin/settings', { key, value }, authHeaders()),
  banUser: (id, status) => axios.patch(`/api/admin/users/${id}/status`, { status }, authHeaders()),
  updateStoryStatus: (id, status) => axios.patch(`/api/admin/stories/${id}/status`, { status }, authHeaders()),

  // Public settings
  getPublicSettings: () => axios.get('/api/settings/public'),
};

export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/';
};
