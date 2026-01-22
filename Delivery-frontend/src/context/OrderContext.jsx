import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { orderService } from '../services';
import { calculateDeliveryTime, calculateDistance, generateTrackingNumber } from '../utils';
import { addMinutes } from 'date-fns';

const OrderContext = createContext();

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DELIVERY_ADDRESS':
      return {
        ...state,
        deliveryAddress: action.payload
      };

    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload
      };

    case 'SET_ACTIVE_ORDER':
      return {
        ...state,
        activeOrder: action.payload
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        activeOrder: action.payload
      };

    case 'UPDATE_ORDER':
      const updatedOrders = state.orders.map(order =>
        (order.id || order._id) === (action.payload.id || action.payload._id) ? action.payload : order
      );
      
      return {
        ...state,
        orders: updatedOrders,
        activeOrder: (state.activeOrder?.id || state.activeOrder?._id) === (action.payload.id || action.payload._id) ? action.payload : state.activeOrder
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};

const initialState = {
  orders: [],
  activeOrder: null,
  deliveryAddress: null,
  loading: false,
  error: null
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const setDeliveryAddress = (address) => {
    dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: address });
  };

  // Fetch user orders from API
  const fetchUserOrders = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await orderService.getUserOrders();
      
      if (response.success) {
        dispatch({ type: 'SET_ORDERS', payload: response.data.orders });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch orders' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch orders' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create new order using API
  const createOrder = async (orderData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        dispatch({ type: 'ADD_ORDER', payload: response.data.order });
        return { success: true, order: response.data.order };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to create order' });
        return { success: false, error: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create order' });
      return { success: false, error: 'Failed to create order' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update order status using API
  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await orderService.updateOrderStatus(orderId, status, notes);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_ORDER', payload: response.data.order });
        return { success: true, order: response.data.order };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to update order status' });
        return { success: false, error: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update order status' });
      return { success: false, error: 'Failed to update order status' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Cancel order using API
  const cancelOrder = async (orderId, reason) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await orderService.cancelOrder(orderId, reason);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_ORDER', payload: response.data.order });
        return { success: true, order: response.data.order };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to cancel order' });
        return { success: false, error: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel order' });
      return { success: false, error: 'Failed to cancel order' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Set active order
  const setActiveOrder = (order) => {
    dispatch({ type: 'SET_ACTIVE_ORDER', payload: order });
  };

  // Helper functions for delivery calculations
  const getDeliveryETA = () => {
    if (!state.activeOrder) return null;
    
    // This would typically come from the API data
    return state.activeOrder.estimatedDeliveryTime ? new Date(state.activeOrder.estimatedDeliveryTime) : null;
  };

  const getDeliveryProgress = () => {
    if (!state.activeOrder) return 0;
    
    // Simple progress calculation based on status
    const statusProgress = {
      'pending': 0,
      'confirmed': 20,
      'preparing': 40,
      'ready': 60,
      'assigned': 70,
      'picked_up': 80,
      'on_the_way': 90,
      'delivered': 100,
      'cancelled': 0
    };
    
    return statusProgress[state.activeOrder.status] || 0;
  };

  const value = {
    ...state,
    setDeliveryAddress,
    fetchUserOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    setActiveOrder,
    getDeliveryETA,
    getDeliveryProgress
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};