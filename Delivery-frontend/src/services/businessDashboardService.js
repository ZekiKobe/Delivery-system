import api from './api.js';

/**
 * Business Dashboard API Service
 * Handles all API calls related to business dashboard functionality
 */
class BusinessDashboardService {
  /**
   * Get dashboard overview data
   */
  async getDashboardOverview() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle business status (open/closed)
   */
  async toggleBusinessStatus() {
    try {
      const response = await api.post('/dashboard/toggle-status');
      return response.data;
    } catch (error) {
      console.error('Toggle business status error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get business orders with filtering
   */
  async getOrders(params = {}) {
    try {
      const response = await api.get('/dashboard/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, statusData) {
    try {
      const response = await api.put(`/dashboard/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get menu items with filtering
   */
  async getMenuItems(params = {}) {
    try {
      const response = await api.get('/dashboard/menu', { params });
      return response;
    } catch (error) {
      console.error('Get menu items error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new menu item
   */
  async createMenuItem(menuItemData) {
    try {
      const response = await api.post('/dashboard/menu', menuItemData);
      return response.data;
    } catch (error) {
      console.error('Create menu item error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update menu item
   */
  async updateMenuItem(itemId, menuItemData) {
    try {
      const response = await api.put(`/dashboard/menu/${itemId}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Update menu item error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(itemId) {
    try {
      const response = await api.delete(`/dashboard/menu/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Delete menu item error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle menu item availability
   */
  async toggleMenuItemAvailability(itemId) {
    try {
      const response = await api.patch(`/dashboard/menu/${itemId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Toggle menu item availability error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get business analytics
   */
  async getAnalytics(period = '30d') {
    try {
      const response = await api.get('/dashboard/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update business information
   */
  async updateBusinessInfo(businessData) {
    try {
      const response = await api.put('/dashboard/business', businessData);
      return response.data;
    } catch (error) {
      console.error('Update business info error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload menu item image
   */
  async uploadMenuImage(file) {
    try {
      const formData = new FormData();
      formData.append('menuImages', file);

      const response = await api.post('/upload/menu-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Upload menu image error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single menu item
   */
  async getMenuItem(itemId) {
    try {
      const response = await api.get(`/dashboard/menu/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Get menu item error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplicate menu item
   */
  async duplicateMenuItem(itemId) {
    try {
      const response = await api.post(`/dashboard/menu/${itemId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Duplicate menu item error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update menu items
   */
  async bulkUpdateMenuItems(items) {
    try {
      const response = await api.patch('/dashboard/menu/bulk-update', { items });
      return response.data;
    } catch (error) {
      console.error('Bulk update menu items error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get menu categories
   */
  async getMenuCategories() {
    try {
      const response = await api.get('/dashboard/menu/categories');
      return response.data;
    } catch (error) {
      console.error('Get menu categories error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create menu category
   */
  async createMenuCategory(categoryData) {
    try {
      const response = await api.post('/dashboard/menu/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Create menu category error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update menu category
   */
  async updateMenuCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/dashboard/menu/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Update menu category error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete menu category
   */
  async deleteMenuCategory(categoryId) {
    try {
      const response = await api.delete(`/dashboard/menu/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Delete menu category error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/dashboard/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order details error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export orders data
   */
  async exportOrders(params = {}) {
    try {
      const response = await api.get('/dashboard/orders/export', {
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Orders exported successfully' };
    } catch (error) {
      console.error('Export orders error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get business metrics for dashboard
   */
  async getBusinessMetrics(period = '30d') {
    try {
      const response = await api.get('/dashboard/metrics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get business metrics error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create business
   */
  async createBusiness(businessData) {
    try {
      const response = await api.post('/businesses', businessData);
      return response.data;
    } catch (error) {
      console.error('Create business error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
        return new Error('Session expired. Please login again.');
      } else if (status === 403) {
        return new Error('Access denied. Insufficient permissions.');
      } else if (status === 404) {
        return new Error(data.message || 'Resource not found.');
      } else if (status === 422) {
        // Validation error
        const errors = data.errors || [];
        const errorMessages = errors.map(err => err.message || err.msg).join(', ');
        return new Error(errorMessages || data.message || 'Validation failed.');
      } else if (status >= 500) {
        return new Error('Server error. Please try again later.');
      } else {
        return new Error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection and try again.');
    } else {
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }
}

export default new BusinessDashboardService();