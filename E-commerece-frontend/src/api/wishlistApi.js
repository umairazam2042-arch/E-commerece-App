import { api } from './axiosClient';

export const wishlistApi = {
  list: () => api.get('/wishlist').then((r) => r.data.data.products),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};