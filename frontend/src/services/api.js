import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Masters API
export const mastersAPI = {
  // Item Categories
  getItemCategories: () => api.get('/masters/item-categories'),
  createItemCategory: (data) => api.post('/masters/item-categories', data),
  updateItemCategory: (id, data) => api.put(`/masters/item-categories/${id}`, data),
  deleteItemCategory: (id) => api.delete(`/masters/item-categories/${id}`),
  moveCategory: (categoryId, newParentId) => api.patch('/masters/item-categories/move-category', { 
    category_id: categoryId, 
    new_parent_id: newParentId 
  }),

  // Items
  getItems: () => api.get('/masters/items'),
  getItem: (id) => api.get(`/masters/items/${id}`),
  createItem: (data) => api.post('/masters/items', data),
  updateItem: (id, data) => api.put(`/masters/items/${id}`, data),
  deleteItem: (id) => api.delete(`/masters/items/${id}`),
  previewNextItemCode: (categoryId) => api.get(`/masters/items/preview/next-code?category_id=${categoryId}`),
  validateItemName: (itemName, categoryId, itemId = null) => {
    const params = new URLSearchParams({ item_name: itemName, category_id: categoryId });
    if (itemId) params.append('item_id', itemId);
    return api.get(`/masters/items/validate/name?${params.toString()}`);
  },
  getLeafCategories: () => api.get('/masters/item-categories/leaf-only'),

  // UOMs
  getUOMs: () => api.get('/masters/uoms'),
  createUOM: (data) => api.post('/masters/uoms', data),

  // Suppliers
  getSuppliers: () => api.get('/masters/suppliers'),
  createSupplier: (data) => api.post('/masters/suppliers', data),

  // Warehouses
  getWarehouses: () => api.get('/masters/warehouses'),
  createWarehouse: (data) => api.post('/masters/warehouses', data),

  // BIN Locations
  getBINLocations: () => api.get('/masters/bin-locations'),
  createBINLocation: (data) => api.post('/masters/bin-locations', data),

  // Tax/HSN
  getTaxHSN: () => api.get('/masters/tax-hsn'),
  createTaxHSN: (data) => api.post('/masters/tax-hsn', data),

  // Colors
  getColors: () => api.get('/masters/colors'),
  createColor: (data) => api.post('/masters/colors', data),

  // Sizes
  getSizes: () => api.get('/masters/sizes'),
  createSize: (data) => api.post('/masters/sizes', data),

  // Brands
  getBrands: () => api.get('/masters/brands'),
  createBrand: (data) => api.post('/masters/brands', data),
};

// Purchase API
export const purchaseAPI = {
  getIndents: () => api.get('/purchase/indents'),
  createIndent: (data) => api.post('/purchase/indents', data),

  getPOs: () => api.get('/purchase/orders'),
  createPO: (data) => api.post('/purchase/orders', data),
  approvePO: (id, remarks) => api.put(`/purchase/orders/${id}/approve`, { remarks }),
  rejectPO: (id, remarks) => api.put(`/purchase/orders/${id}/reject`, { remarks }),
};

// Quality API
export const qualityAPI = {
  getQCs: () => api.get('/quality/checks'),
  createQC: (data) => api.post('/quality/checks', data),
};

// Inventory API
export const inventoryAPI = {
  getGRNs: () => api.get('/inventory/grn'),
  createGRN: (data) => api.post('/inventory/grn', data),

  getStockInwards: () => api.get('/inventory/stock-inward'),
  createStockInward: (data) => api.post('/inventory/stock-inward', data),

  getStockTransfers: () => api.get('/inventory/stock-transfer'),
  createStockTransfer: (data) => api.post('/inventory/stock-transfer', data),

  getIssues: () => api.get('/inventory/issue'),
  createIssue: (data) => api.post('/inventory/issue', data),

  getReturns: () => api.get('/inventory/return'),
  createReturn: (data) => api.post('/inventory/return', data),

  getAdjustments: () => api.get('/inventory/adjustment'),
  createAdjustment: (data) => api.post('/inventory/adjustment', data),

  getStockBalance: () => api.get('/inventory/stock-balance'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Reports API
export const reportsAPI = {
  getStockLedger: (params) => api.get('/reports/stock-ledger', { params }),
  getIssueRegister: (params) => api.get('/reports/issue-register', { params }),
  getPendingPO: () => api.get('/reports/pending-po'),
};

export default api;
