import { Server } from 'socket.io';
import User from '../models/User.js';
import Order from '../models/Order.js';

let io;

export const initializeSocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join room for specific user
      socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      });

      // Join room for specific order
      socket.on('joinOrderRoom', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`User joined room order_${orderId}`);
      });

      // Join room for specific business
      socket.on('joinBusinessRoom', (businessId) => {
        socket.join(`business_${businessId}`);
        console.log(`User joined room business_${businessId}`);
      });

      // Handle location updates
      socket.on('updateLocation', async (data) => {
        try {
          const { userId, lat, lng } = data;
          
          // Update user location
          const user = await User.findByPk(userId);
          if (user && user.role === 'delivery_person') {
            // Initialize delivery_person_profile if it doesn't exist
            if (!user.delivery_person_profile) {
              user.delivery_person_profile = {};
            }
            
            user.delivery_person_profile.currentLocation = { lat, lng };
            user.delivery_person_profile.lastLocationUpdate = new Date();
            await user.save();
            
            // Broadcast location update to relevant rooms
            socket.to(`user_${userId}`).emit('locationUpdated', { userId, lat, lng });
            
            // If user has assigned orders, broadcast to those order rooms
            const assignedOrders = await Order.findAll({
              where: {
                delivery_person_id: userId,
                status: ['assigned', 'picked_up', 'on_the_way']
              }
            });
            
            assignedOrders.forEach(order => {
              io.to(`order_${order.id}`).emit('deliveryLocationUpdated', { 
                orderId: order.id, 
                deliveryPersonId: userId, 
                lat, 
                lng 
              });
            });
          }
        } catch (error) {
          console.error('Location update error:', error);
        }
      });

      // Handle order status updates
      socket.on('updateOrderStatus', async (data) => {
        try {
          const { orderId, status, userId } = data;
          
          // Update order status
          const order = await Order.findByPk(orderId);
          if (order) {
            order.status = status;
            
            // Add tracking information
            const tracking = order.tracking || [];
            tracking.push({
              status,
              timestamp: new Date(),
              userId
            });
            order.tracking = tracking;
            
            await order.save();
            
            // Broadcast status update to relevant rooms
            io.to(`order_${orderId}`).emit('orderStatusUpdated', { orderId, status });
            io.to(`user_${order.customer_id}`).emit('orderStatusUpdated', { orderId, status });
            
            if (order.delivery_person_id) {
              io.to(`user_${order.delivery_person_id}`).emit('orderStatusUpdated', { orderId, status });
            }
          }
        } catch (error) {
          console.error('Order status update error:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    console.log('Socket.IO initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
  }
};

// Emit event to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Emit event to specific order room
export const emitToOrderRoom = (orderId, event, data) => {
  if (io) {
    io.to(`order_${orderId}`).emit(event, data);
  }
};

// Emit event to specific business room
export const emitToBusinessRoom = (businessId, event, data) => {
  if (io) {
    io.to(`business_${businessId}`).emit(event, data);
  }
};

export default { initializeSocket, emitToUser, emitToOrderRoom, emitToBusinessRoom };
