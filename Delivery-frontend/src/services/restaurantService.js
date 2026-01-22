import api, { createFormData } from './api.js';

export const restaurantService = {
  // Get all restaurants
  getRestaurants: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/restaurants?${queryString}` : '/restaurants';
    
    return await api.get(url);
  },

  // Get restaurant by ID
  getRestaurant: async (restaurantId) => {
    return await api.get(`/restaurants/${restaurantId}`);
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId, category = null) => {
    const url = category 
      ? `/restaurants/${restaurantId}/menu?category=${category}`
      : `/restaurants/${restaurantId}/menu`;
    return await api.get(url);
  },

  // Search restaurants
  searchRestaurants: async (searchParams) => {
    return await restaurantService.getRestaurants(searchParams);
  },

  // Get restaurants by location
  getRestaurantsByLocation: async (latitude, longitude, radius = 10) => {
    return await restaurantService.getRestaurants({
      latitude,
      longitude,
      radius
    });
  },

  // Filter restaurants by cuisine
  getRestaurantsByCuisine: async (cuisineTypes) => {
    const cuisine = Array.isArray(cuisineTypes) ? cuisineTypes.join(',') : cuisineTypes;
    return await restaurantService.getRestaurants({ cuisine });
  },

  // Get featured restaurants
  getFeaturedRestaurants: async () => {
    return await restaurantService.getRestaurants({ 
      sortBy: 'featured',
      limit: 8 
    });
  },

  // Get popular restaurants
  getPopularRestaurants: async () => {
    return await restaurantService.getRestaurants({ 
      sortBy: 'rating',
      limit: 8 
    });
  },

  // Restaurant owner operations
  createRestaurant: async (restaurantData, files = {}) => {
    const formData = createFormData(restaurantData, ['logo', 'cover', 'gallery']);
    
    // Add files if provided
    if (files.logo) formData.append('logo', files.logo);
    if (files.cover) formData.append('cover', files.cover);
    if (files.gallery) {
      files.gallery.forEach(file => formData.append('gallery', file));
    }

    return await api.post('/restaurants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateRestaurant: async (restaurantId, restaurantData, files = {}) => {
    const formData = createFormData(restaurantData, ['logo', 'cover', 'gallery']);
    
    // Add files if provided
    if (files.logo) formData.append('logo', files.logo);
    if (files.cover) formData.append('cover', files.cover);
    if (files.gallery) {
      files.gallery.forEach(file => formData.append('gallery', file));
    }

    return await api.put(`/restaurants/${restaurantId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Menu management
  addMenuItem: async (restaurantId, menuItemData, images = []) => {
    const formData = createFormData(menuItemData, ['images']);
    
    images.forEach(image => formData.append('images', image));

    return await api.post(`/restaurants/${restaurantId}/menu`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateMenuItem: async (restaurantId, itemId, menuItemData, images = []) => {
    const formData = createFormData(menuItemData, ['images']);
    
    images.forEach(image => formData.append('images', image));

    return await api.put(`/restaurants/${restaurantId}/menu/${itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteMenuItem: async (restaurantId, itemId) => {
    return await api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
  },

  // Get menu categories
  getMenuCategories: async (restaurantId) => {
    const response = await restaurantService.getRestaurantMenu(restaurantId);
    return response.data?.categories || [];
  },

  // Get menu items by category
  getMenuItemsByCategory: async (restaurantId, category) => {
    const response = await restaurantService.getRestaurantMenu(restaurantId, category);
    return response.data?.menuItems || [];
  }
};