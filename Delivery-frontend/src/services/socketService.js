import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    
    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.setupEventListeners();
    
    return this.socket;
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.io connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
    });

    this.socket.on('error', (error) => {
      console.error('Socket.io error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.io reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket.io failed to reconnect after', this.maxReconnectAttempts, 'attempts');
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  // Order tracking methods
  trackOrder(orderId, callback) {
    if (!this.socket) return;
    
    this.socket.emit('track-order', orderId);
    
    if (callback) {
      this.socket.on('order-status', callback);
      this.socket.on('order-status-update', callback);
    }
  }

  stopTrackingOrder(orderId) {
    if (!this.socket) return;
    
    this.socket.off('order-status');
    this.socket.off('order-status-update');
    this.socket.off('delivery-location-update');
  }

  // Delivery person methods
  updateLocation(userId, latitude, longitude) {
    if (!this.socket) return;
    
    this.socket.emit('updateLocation', {
      userId,
      lat: latitude,
      lng: longitude
    });
  }

  onLocationUpdate(callback) {
    if (!this.socket) return;
    
    this.socket.on('locationUpdated', callback);
  }

  offLocationUpdate() {
    if (!this.socket) return;
    
    this.socket.off('locationUpdated');
  }

  // Delivery location tracking for customers
  onDeliveryLocationUpdate(callback) {
    if (!this.socket) return;
    
    this.socket.on('deliveryLocationUpdated', callback);
  }

  offDeliveryLocationUpdate() {
    if (!this.socket) return;
    
    this.socket.off('deliveryLocationUpdated');
  }

  // Restaurant methods
  joinRestaurantRoom(restaurantId) {
    if (!this.socket) return;
    
    this.socket.emit('join-restaurant', restaurantId);
  }

  onNewOrder(callback) {
    if (!this.socket) return;
    
    this.socket.on('new-order', callback);
  }

  offNewOrder() {
    if (!this.socket) return;
    
    this.socket.off('new-order');
  }

  // Delivery person assignment
  onOrderAssignment(callback) {
    if (!this.socket) return;
    
    this.socket.on('order-assigned', callback);
  }

  offOrderAssignment() {
    if (!this.socket) return;
    
    this.socket.off('order-assigned');
  }

  // General notifications
  onNotification(callback) {
    if (!this.socket) return;
    
    this.socket.on('notification', callback);
  }

  offNotification() {
    if (!this.socket) return;
    
    this.socket.off('notification');
  }

  // System announcements
  onSystemAnnouncement(callback) {
    if (!this.socket) return;
    
    this.socket.on('system-announcement', callback);
  }

  offSystemAnnouncement() {
    if (!this.socket) return;
    
    this.socket.off('system-announcement');
  }

  // Custom event listener
  on(event, callback) {
    if (!this.socket) return;
    
    this.socket.on(event, callback);
  }

  // Remove custom event listener
  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Emit custom event
  emit(event, data) {
    if (!this.socket) return;
    
    this.socket.emit(event, data);
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;