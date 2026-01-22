import React, { createContext, useContext, useReducer } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            id: Date.now().toString(),
            ...action.payload,
            createdAt: new Date().toISOString()
          },
          ...state.notifications
        ]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        }))
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };

    default:
      return state;
  }
};

const initialState = {
  notifications: []
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'info',
        read: false,
        ...notification
      }
    });
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const markAsRead = (id) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  // Notification helpers
  const showSuccess = (message, title = 'Success') => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  };

  const showError = (message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  };

  const showInfo = (message, title = 'Info') => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  };

  const showWarning = (message, title = 'Warning') => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  };

  // Order-specific notifications
  const notifyOrderUpdate = (orderId, status, message) => {
    addNotification({
      type: 'order',
      title: 'Order Update',
      message,
      orderId,
      status,
      duration: 0 // Persistent notification
    });
  };

  const notifyDeliveryUpdate = (orderId, location, estimatedTime) => {
    addNotification({
      type: 'delivery',
      title: 'Delivery Update',
      message: `Your delivery is on the way! ETA: ${estimatedTime}`,
      orderId,
      location,
      duration: 0 // Persistent notification
    });
  };

  // Calculated values
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const value = {
    ...state,
    unreadCount,
    hasUnread,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifyOrderUpdate,
    notifyDeliveryUpdate
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};