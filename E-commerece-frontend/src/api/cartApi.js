import { api } from './axiosClient';

export const cartApi = {
  get: () => api.get('/cart').then((r) => r.data.data.cart),
  addItem: (productId, quantity = 1) =>
    api.post('/cart/items', { productId, quantity }).then((r) => r.data.data.cart),
  updateItem: (productId, quantity) =>
    api.patch(`/cart/items/${productId}`, { quantity }).then((r) => r.data.data.cart),
  removeItem: (productId) =>
    api.delete(`/cart/items/${productId}`).then((r) => r.data.data.cart),
  clear: () => api.delete('/cart'),
};