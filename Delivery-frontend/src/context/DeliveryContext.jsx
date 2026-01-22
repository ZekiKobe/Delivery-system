import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { deliveryService } from '../services';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  deliveryPerson: null,
  availableOrders: [],
  assignedOrders: [],
  currentLocation: null,
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DELIVERY_PERSON: 'SET_DELIVERY_PERSON',
  SET_AVAILABLE_ORDERS: 'SET_AVAILABLE_ORDERS',
  SET_ASSIGNED_ORDERS: 'SET_ASSIGNED_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  REMOVE_ORDER: 'REMOVE_ORDER',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_LOCATION: 'SET_CURRENT_LOCATION'
};

// Reducer
const deliveryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_DELIVERY_PERSON:
      return { ...state, deliveryPerson: action.payload };
    
    case ACTIONS.SET_AVAILABLE_ORDERS:
      return { ...state, availableOrders: action.payload };
    
    case ACTIONS.SET_ASSIGNED_ORDERS:
      return { ...state, assignedOrders: action.payload };
    
    case ACTIONS.ADD_ORDER:
      return { 
        ...state, 
        availableOrders: [...state.availableOrders, action.payload] 
      };
    
    case ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        availableOrders: state.availableOrders.map(order => 
          order._id === action.payload._id ? action.payload : order
        ),
        assignedOrders: state.assignedOrders.map(order => 
          order._id === action.payload._id ? action.payload : order
        )
      };
    
    case ACTIONS.REMOVE_ORDER:
      return {
        ...state,
        availableOrders: state.availableOrders.filter(order => 
          order._id !== action.payload
        ),
        assignedOrders: state.assignedOrders.filter(order => 
          order._id !== action.payload
        )
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_CURRENT_LOCATION:
      return { ...state, currentLocation: action.payload };
    
    default:
      return state;
  }
};

// Create context
const DeliveryContext = createContext();

// Custom hook to use delivery context
export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

// Provider component
export const DeliveryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(deliveryReducer, initialState);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      // Listen for location updates
      socketService.onLocationUpdate((data) => {
        dispatch({ type: ACTIONS.SET_CURRENT_LOCATION, payload: data });
      });
    }
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Fetch delivery profile
  const fetchDeliveryProfile = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.getProfile();
      
      if (response.success) {
        dispatch({ type: ACTIONS.SET_DELIVERY_PERSON, payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch delivery profile');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to fetch delivery profile');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (isAvailable) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.updateAvailability(isAvailable);
      
      if (response.success) {
        dispatch({ 
          type: ACTIONS.SET_DELIVERY_PERSON, 
          payload: { ...state.deliveryPerson, isAvailable } 
        });
        return response;
      } else {
        throw new Error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error(error.message);
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.getAvailableOrders();
      
      if (response.success) {
        dispatch({ type: ACTIONS.SET_AVAILABLE_ORDERS, payload: response.data.orders || [] });
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch available orders');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to fetch available orders');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Fetch assigned orders
  const fetchAssignedOrders = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.getAssignedOrders();
      
      if (response.success) {
        dispatch({ type: ACTIONS.SET_ASSIGNED_ORDERS, payload: response.data.orders || [] });
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch assigned orders');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to fetch assigned orders');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Accept order
  const acceptOrder = async (orderId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.acceptOrder(orderId);
      
      if (response.success) {
        // Move order from available to assigned
        const order = state.availableOrders.find(o => o._id === orderId);
        if (order) {
          dispatch({ type: ACTIONS.REMOVE_ORDER, payload: orderId });
          dispatch({ type: ACTIONS.ADD_ORDER, payload: { ...order, status: 'assigned' } });
        }
        return response;
      } else {
        throw new Error(response.message || 'Failed to accept order');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to accept order');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Decline order
  const declineOrder = async (orderId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.declineOrder(orderId);
      
      if (response.success) {
        dispatch({ type: ACTIONS.REMOVE_ORDER, payload: orderId });
        return response;
      } else {
        throw new Error(response.message || 'Failed to decline order');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to decline order');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await deliveryService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        dispatch({ 
          type: ACTIONS.UPDATE_ORDER, 
          payload: { _id: orderId, status } 
        });
        return response;
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to update order status');
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Context value
  const value = {
    ...state,
    fetchDeliveryProfile,
    updateDeliveryStatus,
    fetchAvailableOrders,
    fetchAssignedOrders,
    acceptOrder,
    declineOrder,
    updateOrderStatus
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};