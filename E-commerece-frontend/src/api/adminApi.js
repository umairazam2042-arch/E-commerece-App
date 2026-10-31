import { api } from './axiosClient';

const unwrapList = (d) => (Array.isArray(d) ? d : d.items ?? d.categories ?? []);

export const adminApi = {
  analytics: () => api.get('/admin/analytics').then((r) => r.data.data),

  categories: () => api.get('/admin/categories').then((r) => unwrapList(r.data.data)),
  createCategory: (data) => api.post('/admin/categories', data).then((r) => r.data.data),
  updateCategory: (id, data) =>
    api.patch(`/admin/categories/${id}`, data).then((r) => r.data.data),

  coupons: (params) => api.get('/admin/coupons', { params }).then((r) => r.data.data),
  createCoupon: (data) => api.post('/admin/coupons', data).then((r) => r.data.data),
  updateCoupon: (id, data) => api.patch(`/admin/coupons/${id}`, data).then((r) => r.data.data),

  vendors: (params) => api.get('/admin/vendors', { params }).then((r) => r.data.data),
  approveVendor: (id) => api.patch(`/admin/vendors/${id}/approve`).then((r) => r.data.data),
  rejectVendor: (id, reason) =>
    api.patch(`/admin/vendors/${id}/reject`, { reason }).then((r) => r.data.data),

  exchangeRates: () => api.get('/admin/exchange-rates').then((r) => unwrapList(r.data.data)),
  setExchangeRate: (data) => api.post('/admin/exchange-rates', data).then((r) => r.data.data),
};