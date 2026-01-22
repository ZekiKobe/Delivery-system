import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          // Bad Request - validation errors
          console.error('Validation error:', response.data);
          if (response.data.errors && Array.isArray(response.data.errors)) {
            // Handle express-validator errors
            const errorMessages = response.data.errors.map(err => err.msg).join(', ');
            console.error('Validation details:', errorMessages);
          }
          break;
          
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          console.error('Access denied:', response.data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', response.data.message);
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', response.data.errors);
          break;
          
        case 429:
          // Too many requests
          console.error('Rate limit exceeded. Please try again later.');
          break;
          
        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;
          
        default:
          console.error('API Error:', response.data.message || 'Unknown error');
      }
      
      // Return the error response data
      return Promise.reject(response.data);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.'
      });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred.'
      });
    }
  }
);

// Refresh token functionality
export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken
    });

    const { token, refreshToken: newRefreshToken } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return token;
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};

// Helper function for file uploads
export const createFormData = (data, fileFields = []) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (fileFields.includes(key)) {
      // Handle file fields
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].forEach(file => formData.append(key, file));
        } else {
          formData.append(key, data[key]);
        }
      }
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      // Handle nested objects
      formData.append(key, JSON.stringify(data[key]));
    } else {
      // Handle primitive values
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// Export the configured axios instance
export default api;