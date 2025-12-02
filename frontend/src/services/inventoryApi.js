import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api/inventory`;

// Create axios instance with default config
const inventoryApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
inventoryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
inventoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Masters API ============
export const mastersAPI = {
  // Item Category
  getItemCategories: () => inventoryApi.get('/masters/item-categories'),
  getItemCategory: (id) => inventoryApi.get(`/masters/item-categories/${id}`),
  createItemCategory: (data) => inventoryApi.post('/masters/item-categories', data),
  updateItemCategory: (id, data) => inventoryApi.put(`/masters/item-categories/${id}`, data),
  deleteItemCategory: (id) => inventoryApi.delete(`/masters/item-categories/${id}`),

  // Item Master
  getItems: () => inventoryApi.get('/masters/items'),
  getItem: (id) => inventoryApi.get(`/masters/items/${id}`),
  createItem: (data) => inventoryApi.post('/masters/items', data),
  updateItem: (id, data) => inventoryApi.put(`/masters/items/${id}`, data),
  deleteItem: (id) => inventoryApi.delete(`/masters/items/${id}`),

  // UOM
  getUOMs: () => inventoryApi.get('/masters/uoms'),
  createUOM: (data) => inventoryApi.post('/masters/uoms', data),
  updateUOM: (id, data) => inventoryApi.put(`/masters/uoms/${id}`, data),
  deleteUOM: (id) => inventoryApi.delete(`/masters/uoms/${id}`),

  // Warehouse
  getWarehouses: () => inventoryApi.get('/masters/warehouses'),
  createWarehouse: (data) => inventoryApi.post('/masters/warehouses', data),
  updateWarehouse: (id, data) => inventoryApi.put(`/masters/warehouses/${id}`, data),
  deleteWarehouse: (id) => inventoryApi.delete(`/masters/warehouses/${id}`),

  // BIN
  getBINs: () => inventoryApi.get('/masters/bins'),
  createBIN: (data) => inventoryApi.post('/masters/bins', data),
  updateBIN: (id, data) => inventoryApi.put(`/masters/bins/${id}`, data),
  deleteBIN: (id) => inventoryApi.delete(`/masters/bins/${id}`),

  // Brand
  getBrands: () => inventoryApi.get('/masters/brands'),
  createBrand: (data) => inventoryApi.post('/masters/brands', data),
  updateBrand: (id, data) => inventoryApi.put(`/masters/brands/${id}`, data),
  deleteBrand: (id) => inventoryApi.delete(`/masters/brands/${id}`),

  // Attributes
  getAttributes: () => inventoryApi.get('/masters/attributes'),
  createAttribute: (data) => inventoryApi.post('/masters/attributes', data),
  updateAttribute: (id, data) => inventoryApi.put(`/masters/attributes/${id}`, data),
  deleteAttribute: (id) => inventoryApi.delete(`/masters/attributes/${id}`)
};

// ============ Transactions API ============
export const transactionsAPI = {
  // Opening Stock
  getOpeningStocks: () => inventoryApi.get('/transactions/opening-stock'),
  createOpeningStock: (data) => inventoryApi.post('/transactions/opening-stock', data),

  // Goods Receipt
  getGoodsReceipts: () => inventoryApi.get('/transactions/goods-receipt'),
  createGoodsReceipt: (data) => inventoryApi.post('/transactions/goods-receipt', data),

  // Stock Issue
  getStockIssues: () => inventoryApi.get('/transactions/stock-issue'),
  createStockIssue: (data) => inventoryApi.post('/transactions/stock-issue', data),

  // Stock Transfer
  getStockTransfers: () => inventoryApi.get('/transactions/transfer'),
  createStockTransfer: (data) => inventoryApi.post('/transactions/transfer', data),

  // Stock Adjustment
  getStockAdjustments: () => inventoryApi.get('/transactions/adjustment'),
  createStockAdjustment: (data) => inventoryApi.post('/transactions/adjustment', data),

  // Stock Audit
  getStockAudits: () => inventoryApi.get('/transactions/audit'),
  createStockAudit: (data) => inventoryApi.post('/transactions/audit', data)
};

// ============ Reports API ============
export const reportsAPI = {
  getStockLedger: (params) => inventoryApi.get('/reports/stock-ledger', { params }),
  getItemBalance: (params) => inventoryApi.get('/reports/item-balance', { params }),
  getBINStock: (params) => inventoryApi.get('/reports/bin-stock', { params }),
  getDeadStock: (params) => inventoryApi.get('/reports/dead-stock', { params })
};

// ============ Settings API ============
export const settingsAPI = {
  getNumberSeries: () => inventoryApi.get('/settings/number-series'),
  updateNumberSeries: (data) => inventoryApi.put('/settings/number-series', data),

  getRoles: () => inventoryApi.get('/settings/roles'),
  updateRoles: (data) => inventoryApi.put('/settings/roles', data),

  getGLMapping: () => inventoryApi.get('/settings/gl-mapping'),
  updateGLMapping: (data) => inventoryApi.put('/settings/gl-mapping', data),

  getApprovalWorkflow: () => inventoryApi.get('/settings/approval'),
  updateApprovalWorkflow: (data) => inventoryApi.put('/settings/approval', data)
};

export default inventoryApi;