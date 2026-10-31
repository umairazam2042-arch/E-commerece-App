import { api } from './axiosClient';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data.data),
  logout: () => api.post('/auth/logout'),
  // Backend { user } bhejta hai, is liye .user return karein
  me: () => api.get('/auth/me').then((r) => r.data.data.user),
};