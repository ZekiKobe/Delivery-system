import api from './api.js';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/orders/my-orders?${queryString}` : '/orders/my-orders';
    
    return await api.get(url);
  },

  // Get order by ID
  getOrder: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  // Update order status (restaurant/delivery person)
  updateOrderStatus: async (orderId, status, notes = '') => {
    return await api.put(`/orders/${orderId}/status`, { status, notes });
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return await api.put(`/orders/${orderId}/cancel`, { reason });
  },

  // Get restaurant orders (restaurant owner)
  getRestaurantOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/orders/restaurant/orders?${queryString}` : '/orders/restaurant/orders';
    
    return await api.get(url);
  },

  // Get delivery orders (delivery person)
  getDeliveryOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/orders/delivery/orders?${queryString}` : '/orders/delivery/orders';
    
    return await api.get(url);
  },

  // Order tracking
  getOrderTracking: async (orderId) => {
    return await api.get(`/delivery/orders/${orderId}/tracking`);
  },

  // Get live tracking (customer only)
  getLiveTracking: async (orderId) => {
    return await api.get(`/delivery/orders/${orderId}/live`);
  },

  // Filter orders by status
  getOrdersByStatus: async (status) => {
    return await orderService.getUserOrders({ status });
  },

  // Get order history
  getOrderHistory: async (page = 1, limit = 10) => {
    return await orderService.getUserOrders({ page, limit });
  },

  // Search orders
  searchOrders: async (searchTerm, status = null) => {
    const params = {};
    if (status) params.status = status;
    
    const response = await orderService.getUserOrders(params);
    
    // Filter results by search term on client side
    if (searchTerm && response.success) {
      const filteredOrders = response.data.orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return {
        ...response,
        data: {
          ...response.data,
          orders: filteredOrders
        }
      };
    }
    
    return response;
  },

  // Calculate order total
  calculateOrderTotal: (items, deliveryFee = 0, serviceFee = 0, tax = 0, discount = 0) => {
    const subtotal = items.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      
      // Add modifier costs
      if (item.modifiers && item.modifiers.length > 0) {
        const modifierTotal = item.modifiers.reduce((sum, modifier) => 
          sum + (modifier.price * item.quantity), 0
        );
        itemTotal += modifierTotal;
      }
      
      return total + itemTotal;
    }, 0);

    const total = subtotal + deliveryFee + serviceFee + tax - discount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  },

  // Validate order before submission
  validateOrder: (orderData) => {
    const errors = [];

    // Check required fields
    if (!orderData.restaurantId) {
      errors.push('Restaurant is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (!orderData.deliveryAddress) {
      errors.push('Delivery address is required');
    }

    if (!orderData.paymentMethod) {
      errors.push('Payment method is required');
    }

    // Validate items
    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (!item.menuItem) {
          errors.push(`Item ${index + 1}: Menu item is required`);
        }
        
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Valid quantity is required`);
        }
      });
    }

    // Validate delivery address
    if (orderData.deliveryAddress) {
      const requiredFields = ['street', 'city', 'state', 'zipCode'];
      requiredFields.forEach(field => {
        if (!orderData.deliveryAddress[field]) {
          errors.push(`Delivery address ${field} is required`);
        }
      });

      if (!orderData.deliveryAddress.coordinates) {
        errors.push('Delivery address coordinates are required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};