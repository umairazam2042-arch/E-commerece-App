import { api } from './axiosClient';

export const orderApi = {
  checkout: (data) => api.post('/orders/checkout', data).then((r) => r.data.data),
    buyNow: (data) => api.post('/orders/buy-now', data).then((r) => r.data.data),
  list: (params) => api.get('/orders', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data.data),
  cancel: (id) => api.patch(`/orders/${id}/cancel`).then((r) => r.data.data),
};