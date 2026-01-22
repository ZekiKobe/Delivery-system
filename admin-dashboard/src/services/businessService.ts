import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/business';

// Configure axios with auth token
const businessApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
businessApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
businessApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product Management
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await businessApi.get('/products', { params });
  return response.data;
};

export const createProduct = async (productData: FormData) => {
  const response = await businessApi.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (productId: string, productData: FormData) => {
  const response = await businessApi.put(`/products/${productId}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (productId: string) => {
  const response = await businessApi.delete(`/products/${productId}`);
  return response.data;
};

export const bulkUpdateProducts = async (productIds: string[], operation: string, data?: any) => {
  const response = await businessApi.post('/products/bulk', {
    productIds,
    operation,
    data,
  });
  return response.data;
};

// Category Management
export const getCategories = async () => {
  const response = await businessApi.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  image?: File;
}) => {
  const formData = new FormData();
  formData.append('name', categoryData.name);
  if (categoryData.description) {
    formData.append('description', categoryData.description);
  }
  if (categoryData.image) {
    formData.append('image', categoryData.image);
  }

  const response = await businessApi.post('/categories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateCategory = async (categoryId: string, categoryData: {
  name?: string;
  description?: string;
  image?: File;
}) => {
  const formData = new FormData();
  if (categoryData.name) formData.append('name', categoryData.name);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.image) formData.append('image', categoryData.image);

  const response = await businessApi.put(`/categories/${categoryId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCategory = async (categoryId: string) => {
  const response = await businessApi.delete(`/categories/${categoryId}`);
  return response.data;
};

// Inventory Management
export const getInventory = async (params?: {
  page?: number;
  limit?: number;
  productId?: string;
  alertsOnly?: boolean;
}) => {
  const response = await businessApi.get('/inventory', { params });
  return response.data;
};

export const updateStock = async (productId: string, data: {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}) => {
  const response = await businessApi.put(`/inventory/${productId}/stock`, data);
  return response.data;
};

export const getInventoryAlerts = async () => {
  const response = await businessApi.get('/inventory/alerts');
  return response.data;
};

export const getInventoryReports = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
}) => {
  const response = await businessApi.get('/inventory/reports', { params });
  return response.data;
};

// Business Orders
export const getBusinessOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await businessApi.get('/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
  const response = await businessApi.put(`/orders/${orderId}/status`, {
    status,
    notes,
  });
  return response.data;
};

// Business Analytics
export const getBusinessAnalytics = async (params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}) => {
  const response = await businessApi.get('/analytics', { params });
  return response.data;
};

export const getBusinessStats = async () => {
  const response = await businessApi.get('/analytics/stats');
  return response.data;
};

// Business Profile Management
export const getBusinessProfile = async () => {
  const response = await businessApi.get('/profile');
  return response.data;
};

export const updateBusinessProfile = async (profileData: FormData) => {
  const response = await businessApi.put('/profile', profileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadBusinessDocuments = async (documents: FormData) => {
  const response = await businessApi.post('/profile/documents', documents, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default businessApi;
