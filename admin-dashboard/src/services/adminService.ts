import axios from 'axios';
import type { 
  User, 
  UsersResponse, 
  UserStats, 
  Business, 
  BusinessesResponse, 
  Order, 
  OrdersResponse,
  DashboardStats,
  AnalyticsData,
  VerificationApplication,
  VerificationStats
} from './interfaces';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Configure axios with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User Management
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<UsersResponse> => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get('/users/stats');
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<{ data: { user: User } }> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{ data: { user: User } }> => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string, hardDelete?: boolean): Promise<{ data: { userId: string } }> => {
  const response = await api.delete(`/users/${userId}`, { data: { hardDelete } });
  return response.data;
};

export const updateUserRole = async (userId: string, newRole: string, reason?: string): Promise<{ data: { user: User } }> => {
  const response = await api.put(`/users/${userId}/role`, { newRole, reason });
  return response.data;
};

export const bulkUpdateUsers = async (userIds: string[], operation: string, data?: any): Promise<{ data: { modifiedCount: number } }> => {
  const response = await api.post('/users/bulk', { userIds, operation, data });
  return response.data;
};

// Business Management
export const getAllBusinesses = async (params?: {
  page?: number;
  limit?: number;
  businessType?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<BusinessesResponse> => {
  const response = await api.get('/businesses', { params });
  return response.data;
};

export const getBusinessStats = async (): Promise<any> => {
  const response = await api.get('/businesses/stats');
  return response.data;
};

export const updateBusiness = async (businessId: string, businessData: Partial<Business>): Promise<{ data: { business: Business } }> => {
  const response = await api.put(`/businesses/${businessId}`, businessData);
  return response.data;
};

export const deleteBusiness = async (businessId: string, hardDelete?: boolean): Promise<{ data: { businessId: string } }> => {
  const response = await api.delete(`/businesses/${businessId}`, { data: { hardDelete } });
  return response.data;
};

export const verifyBusiness = async (businessId: string, status: string, reason?: string): Promise<{ data: { business: Business } }> => {
  const response = await api.put(`/businesses/${businessId}/verify`, { status, reason });
  return response.data;
};

// Order Management
export const getAllOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<OrdersResponse> => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderStats = async (): Promise<any> => {
  const response = await api.get('/orders/stats');
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string, notes?: string): Promise<{ data: { order: Order } }> => {
  const response = await api.put(`/orders/${orderId}/status`, { status, notes });
  return response.data;
};

// Analytics
export const getDashboardStats = async (period?: string): Promise<DashboardStats> => {
  const response = await api.get('/analytics/dashboard', { params: { period } });
  return response.data;
};

export const getAnalyticsData = async (params?: {
  type?: string;
  period?: string;
  groupBy?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AnalyticsData> => {
  const response = await api.get('/analytics/data', { params });
  return response.data;
};

// Auth
export const login = async (email: string, password: string) => {
  const response = await axios.post("http://localhost:5000/api/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data.data;

  // Save token and user info for future requests
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(user));

  return { token, user };
};

export const getCurrentUser = (): any | null => {
  const user = localStorage.getItem("adminUser");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (err) {
    console.error("Failed to parse adminUser:", err);
    return null;
  }
};



export const logout = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

// Verification Management
export const getAllVerificationApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  businessType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{ data: { applications: VerificationApplication[]; pagination: any } }> => {
  const response = await api.get('/verification/applications', { params });
  return response.data;
};

export const reviewVerificationApplication = async (
  verificationId: string, 
  reviewData: {
    status: string;
    comments: string;
    changesRequested: string[];
    documentReviews: any[];
  }
): Promise<{ data: { verification: VerificationApplication } }> => {
  const response = await api.post(`/verification/${verificationId}/review`, reviewData);
  return response.data;
};

export const assignReviewer = async (
  verificationId: string, 
  reviewerId: string
): Promise<{ data: { verification: VerificationApplication } }> => {
  const response = await api.post(`/verification/${verificationId}/assign`, { reviewerId });
  return response.data;
};

export const requestAdditionalInfo = async (
  verificationId: string, 
  requestData: {
    message: string;
    documentsRequested: string[];
    dueDate?: string;
  }
): Promise<{ data: { verification: VerificationApplication } }> => {
  const response = await api.post(`/verification/${verificationId}/request-info`, requestData);
  return response.data;
};

export const getVerificationStatistics = async (): Promise<{ data: VerificationStats }> => {
  const response = await api.get('/verification/statistics');
  return response.data;
};

export const getVerificationApplicationById = async (verificationId: string): Promise<{ data: VerificationApplication }> => {
  const response = await api.get(`/verification/applications/${verificationId}`);
  return response.data;
};

export const updateDocumentStatus = async (
  verificationId: string,
  documentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<{ data: VerificationApplication }> => {
  const response = await api.put(`/verification/${verificationId}/documents/${documentId}`, {
    status,
    rejectionReason
  });
  return response.data;
};

// User Management - Get single user
export const getUserById = async (userId: string): Promise<{ data: { user: User } }> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Order Management - Get all orders
// (definition exists earlier in this file)

// Create verification applications for existing businesses
export const createVerificationForExistingBusinesses = async (): Promise<{ data: { createdCount: number; totalBusinesses: number; createdVerifications: string[] } }> => {
  const response = await api.post('/verification/create-for-existing-businesses');
  return response.data;
};

export default api;