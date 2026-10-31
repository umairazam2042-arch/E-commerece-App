import { api } from './axiosClient';

const unwrapList = (d) => (Array.isArray(d) ? d : d.items ?? d.categories ?? []);

export const vendorApi = {
  // Products
  products: (params) => api.get('/vendor/products', { params }).then((r) => r.data.data),
  createProduct: (data) => api.post('/vendor/products', data).then((r) => r.data.data),
  updateProduct: (id, data) =>
    api.patch(`/vendor/products/${id}`, data).then((r) => r.data.data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  categories: () => api.get('/categories').then((r) => unwrapList(r.data.data)),

  // Vendor profile
  myVendor: () => api.get('/vendors/me').then((r) => r.data.data.vendor),
  apply: (data) => api.post('/vendors/apply', data).then((r) => r.data.data.vendor),

  // Orders
  orders: (params) => api.get('/vendor/orders', { params }).then((r) => r.data.data),
  updateOrderStatus: (subOrderId, status) =>
    api.patch(`/vendor/orders/${subOrderId}/status`, { status }).then((r) => r.data.data),

  // Reviews
  replyToReview: (reviewId, text) =>
    api.post(`/vendor/reviews/${reviewId}/reply`, { text }).then((r) => r.data.data),

  // Inventory: list product routes se aati hai (sirf is vendor ke products)
  inventory: (params) => api.get('/vendor/products', { params }).then((r) => r.data.data),
  lowStock: () => api.get('/vendor/inventory/low-stock').then((r) => r.data.data),
  adjustStock: (productId, data) =>
    api.patch(`/vendor/inventory/products/${productId}/stock`, data).then((r) => r.data.data),
  setThreshold: (productId, lowStockThreshold) =>
    api.patch(`/vendor/inventory/products/${productId}/threshold`, { lowStockThreshold }).then(
      (r) => r.data.data
    ),
  bulkUpdate: (updates) =>
    api.put('/vendor/inventory/bulk', { updates }).then((r) => r.data.data),
  stockMovements: (productId, params) =>
    api.get(`/vendor/inventory/products/${productId}/movements`, { params }).then(
      (r) => r.data.data
    ),
};