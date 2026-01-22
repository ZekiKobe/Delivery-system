import api, { createFormData } from './api.js';

export const businessService = {
  // Get all businesses
  getBusinesses: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/businesses?${queryString}` : '/businesses';
    
    return await api.get(url);
  },

  // Get business by ID
  getBusiness: async (businessId) => {
    return await api.get(`/businesses/${businessId}`);
  },

  // Get business products/menu
  getBusinessProducts: async (businessId, category = null) => {
    const url = category 
      ? `/businesses/${businessId}/products?category=${category}`
      : `/businesses/${businessId}/products`;
    return await api.get(url);
  },

  // Search businesses
  searchBusinesses: async (searchParams) => {
    return await businessService.getBusinesses(searchParams);
  },

  // Get businesses by location
  getBusinessesByLocation: async (latitude, longitude, radius = 10) => {
    return await businessService.getBusinesses({
      latitude,
      longitude,
      radius
    });
  },

  // Filter businesses by category
  getBusinessesByCategory: async (categories) => {
    const category = Array.isArray(categories) ? categories.join(',') : categories;
    return await businessService.getBusinesses({ category });
  },

  // Get featured businesses
  getFeaturedBusinesses: async () => {
    return await businessService.getBusinesses({ 
      sortBy: 'featured',
      limit: 8 
    });
  },

  // Get popular businesses
  getPopularBusinesses: async () => {
    return await businessService.getBusinesses({ 
      sortBy: 'rating',
      limit: 8 
    });
  },

  // Business owner operations
  createBusiness: async (businessData, files = {}) => {
    const formData = createFormData(businessData, ['logo', 'cover', 'gallery']);
    
    // Add files if provided
    if (files.logo) formData.append('logo', files.logo);
    if (files.cover) formData.append('cover', files.cover);
    if (files.gallery) {
      files.gallery.forEach(file => formData.append('gallery', file));
    }

    return await api.post('/businesses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateBusiness: async (businessId, businessData, files = {}) => {
    const formData = createFormData(businessData, ['logo', 'cover', 'gallery']);
    
    // Add files if provided
    if (files.logo) formData.append('logo', files.logo);
    if (files.cover) formData.append('cover', files.cover);
    if (files.gallery) {
      files.gallery.forEach(file => formData.append('gallery', file));
    }

    return await api.put(`/businesses/${businessId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Product management
  addProduct: async (businessId, productData, images = []) => {
    const formData = createFormData(productData, ['images']);
    
    images.forEach(image => formData.append('images', image));

    return await api.post(`/businesses/${businessId}/products`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateProduct: async (businessId, productId, productData, images = []) => {
    const formData = createFormData(productData, ['images']);
    
    images.forEach(image => formData.append('images', image));

    return await api.put(`/businesses/${businessId}/products/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProduct: async (businessId, productId) => {
    return await api.delete(`/businesses/${businessId}/products/${productId}`);
  },

  // Get product categories
  getProductCategories: async (businessId) => {
    const response = await businessService.getBusinessProducts(businessId);
    return response.data?.categories || [];
  },

  // Get products by category
  getProductsByCategory: async (businessId, category) => {
    const response = await businessService.getBusinessProducts(businessId, category);
    return response.data?.products || [];
  }
};