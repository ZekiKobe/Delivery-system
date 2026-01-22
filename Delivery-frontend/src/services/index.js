// Export all services
export { authService } from './authService.js';
export { userService } from './userService.js';
export { restaurantService } from './restaurantService.js';
export { businessService } from './businessService.js';
export { orderService } from './orderService.js';
export { paymentService } from './paymentService.js';
export { deliveryService } from './deliveryService.js';
export { default as socketService } from './socketService.js';
export { default as businessDashboardService } from './businessDashboardService.js';
export { default as adminService } from './adminService.js';
export { ecommerceService } from './ecommerceService.js';

// Export API instance for direct use if needed
export { default as api } from './api.js';

// Service status constants
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  ADDRESS_ADDED: 'Address added successfully',
  ADDRESS_UPDATED: 'Address updated successfully',
  ADDRESS_DELETED: 'Address deleted successfully'
};