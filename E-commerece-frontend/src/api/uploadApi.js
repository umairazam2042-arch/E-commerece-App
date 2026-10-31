import { api } from './axiosClient';

export const uploadApi = {
  auth: () => api.get('/vendor/uploads/auth').then((r) => r.data.data),
};