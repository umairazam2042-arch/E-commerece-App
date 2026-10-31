import { api } from './axiosClient';

export const adminOrderApi = {
  list: (params) => api.get('/admin/orders', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data.data),
};