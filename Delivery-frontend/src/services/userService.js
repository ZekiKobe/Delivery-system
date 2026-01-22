import api, { createFormData } from './api.js';

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    const formData = createFormData({ avatar: avatarFile }, ['avatar']);
    return await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/users/change-password', passwordData);
  },

  // Address management
  addAddress: async (addressData) => {
    return await api.post('/users/addresses', addressData);
  },

  updateAddress: async (addressId, addressData) => {
    return await api.put(`/users/addresses/${addressId}`, addressData);
  },

  deleteAddress: async (addressId) => {
    return await api.delete(`/users/addresses/${addressId}`);
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    return await api.put('/users/preferences', preferences);
  },

  // Delete account
  deleteAccount: async (password) => {
    return await api.delete('/users/account', { data: { password } });
  }
};