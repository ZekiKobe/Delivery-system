import api from './api.js';

export const deliveryService = {
  // Delivery person operations
  getProfile: async () => {
    return await api.get('/users/profile');
  },
  
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },
  
  updateLocation: async (userId, latitude, longitude) => {
    // Update location via API
    const apiResponse = await api.post('/delivery/location', { lat: latitude, lng: longitude });
    
    // Also emit via socket for real-time updates
    import('./socketService').then((socketModule) => {
      socketModule.default.updateLocation(userId, latitude, longitude);
    });
    
    return apiResponse;
  },

  getDeliveryRoute: async (orderId) => {
    return await api.get(`/delivery/route/${orderId}`);
  },

  updateAvailability: async (isAvailable) => {
    return await api.put('/delivery/availability', { isAvailable });
  },

  // Order operations
  getAvailableOrders: async () => {
    // Get available orders for delivery
    return await api.get('/orders/delivery/orders?status=available');
  },

  getAssignedOrders: async () => {
    // Get orders assigned to this delivery person
    return await api.get('/orders/delivery/orders');
  },

  acceptOrder: async (orderId) => {
    // Accept an order by updating its status to 'assigned'
    return await api.put(`/orders/${orderId}/status`, { status: 'assigned' });
  },

  declineOrder: async (orderId) => {
    return await api.post(`/delivery/orders/${orderId}/decline`);
  },

  updateOrderStatus: async (orderId, status) => {
    return await api.put(`/orders/${orderId}/status`, { status });
  },

  getStats: async () => {
    return await api.get('/delivery/stats');
  },

  // Order tracking
  getOrderTracking: async (orderId) => {
    return await api.get(`/delivery/orders/${orderId}/tracking`);
  },

  getLiveTracking: async (orderId) => {
    return await api.get(`/delivery/orders/${orderId}/live`);
  },

  // Location utilities
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    });
  },

  watchLocation: (callback, errorCallback) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        errorCallback(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
      }
    );
  },

  stopWatchingLocation: (watchId) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  // Distance calculation
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deliveryService.deg2rad(lat2 - lat1);
    const dLon = deliveryService.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deliveryService.deg2rad(lat1)) *
        Math.cos(deliveryService.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  },

  deg2rad: (deg) => {
    return deg * (Math.PI / 180);
  },

  // Format distance for display
  formatDistance: (distanceInKm) => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    }
    return `${distanceInKm.toFixed(1)}km`;
  },

  // Estimate delivery time based on distance
  estimateDeliveryTime: (distanceInKm, avgSpeedKmh = 30) => {
    const timeInHours = distanceInKm / avgSpeedKmh;
    const timeInMinutes = Math.ceil(timeInHours * 60);
    return Math.max(timeInMinutes, 5); // Minimum 5 minutes
  },

  // Format delivery time for display
  formatDeliveryTime: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  // Track order progress
  getOrderProgress: (orderStatus) => {
    const progressMap = {
      'pending': { percentage: 0, step: 0, label: 'Order Placed' },
      'confirmed': { percentage: 15, step: 1, label: 'Order Confirmed' },
      'preparing': { percentage: 40, step: 2, label: 'Being Prepared' },
      'ready': { percentage: 60, step: 3, label: 'Ready for Pickup' },
      'assigned': { percentage: 70, step: 4, label: 'Driver Assigned' },
      'picked_up': { percentage: 80, step: 5, label: 'Picked Up' },
      'on_the_way': { percentage: 90, step: 6, label: 'On the Way' },
      'delivered': { percentage: 100, step: 7, label: 'Delivered' },
      'cancelled': { percentage: 0, step: -1, label: 'Cancelled' }
    };

    return progressMap[orderStatus] || { percentage: 0, step: 0, label: 'Unknown' };
  },

  // Get delivery status color
  getStatusColor: (status) => {
    const colorMap = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#8b5cf6',
      'ready': '#06b6d4',
      'assigned': '#10b981',
      'picked_up': '#059669',
      'on_the_way': '#dc2626',
      'delivered': '#16a34a',
      'cancelled': '#6b7280'
    };

    return colorMap[status] || '#6b7280';
  },

  // Check if location permission is granted
  checkLocationPermission: async () => {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      return 'unsupported';
    }
  },

  // Request location permission
  requestLocationPermission: async () => {
    try {
      const position = await deliveryService.getCurrentLocation();
      return { granted: true, location: position };
    } catch (error) {
      return { granted: false, error: error.message };
    }
  },

  // Generate Google Maps URL for directions
  getDirectionsUrl: (fromLat, fromLng, toLat, toLng) => {
    return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
  },

  // Generate Apple Maps URL for directions (iOS)
  getAppleMapsUrl: (fromLat, fromLng, toLat, toLng) => {
    return `http://maps.apple.com/?saddr=${fromLat},${fromLng}&daddr=${toLat},${toLng}&dirflg=d`;
  },

  // Open navigation app
  openNavigation: (fromLat, fromLng, toLat, toLng) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(deliveryService.getAppleMapsUrl(fromLat, fromLng, toLat, toLng));
    } else {
      window.open(deliveryService.getDirectionsUrl(fromLat, fromLng, toLat, toLng));
    }
  }
};