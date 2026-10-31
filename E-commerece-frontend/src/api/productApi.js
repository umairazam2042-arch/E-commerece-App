import { api } from './axiosClient';

export const productApi = {
  search: (params) => api.get('/search/products', { params }).then((r) => r.data.data),
  suggest: (q) => api.get('/search/suggest', { params: { q } }).then((r) => r.data.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data.data.product),
};