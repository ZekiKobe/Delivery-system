import api from './api.js';

/**
 * Admin API Service
 * Handles all API calls related to admin functionality
 */
class AdminService {
  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/admin/users/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, roleData) {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, roleData);
      return response.data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(bulkData) {
    try {
      const response = await api.post('/admin/users/bulk', bulkData);
      return response.data;
    } catch (error) {
      console.error('Bulk update users error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AdminService();