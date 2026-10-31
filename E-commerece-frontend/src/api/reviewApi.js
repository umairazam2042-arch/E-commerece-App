import { api } from './axiosClient';

export const reviewApi = {
  list: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }).then((r) => r.data.data),
  create: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data).then((r) => r.data.data),
  update: (reviewId, data) =>
    api.patch(`/reviews/${reviewId}`, data).then((r) => r.data.data),
  remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
};