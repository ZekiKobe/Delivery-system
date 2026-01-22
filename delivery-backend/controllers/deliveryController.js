import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { Op } from 'sequelize';
import { emitToUser, emitToOrderRoom } from '../services/socketService.js';
import { updateDeliveryPersonRating } from './orderController.js';

// Get available orders for delivery
export const getAvailableOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Check if delivery person profile is complete
    if (!req.user.delivery_person_profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your delivery person profile first'
      });
    }
    
    // Build query for available orders
    const whereClause = {
      status: 'ready' // Orders ready for pickup
    };
    
    if (status) {
      whereClause.status = status;
    }
    
    const orders = await Order.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    const count = await Order.count({ where: whereClause });
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Accept order for delivery
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedPickupTime } = req.body;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Check if delivery person is available
    if (!req.user.delivery_person_profile?.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'You are not available for deliveries'
      });
    }
    
    // Find order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is ready for pickup
    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for pickup'
      });
    }
    
    // Update order status
    order.status = 'assigned';
    order.delivery_person_id = req.user.id;
    
    // Add tracking information
    const tracking = order.tracking || [];
    tracking.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: `Order assigned to ${req.user.getFullName()}`
    });
    order.tracking = tracking;
    
    await order.save();
    
    // Update delivery person availability
    const user = await User.findByPk(req.user.id);
    user.delivery_person_profile.isAvailable = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, notes } = req.body;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Validate status
    const validStatuses = ['picked_up', 'on_the_way', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is assigned to this delivery person
    if (order.delivery_person_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Order not assigned to you'
      });
    }
    
    // Update order status
    order.status = status;
    
    // Add tracking information
    const tracking = order.tracking || [];
    tracking.push({
      status,
      timestamp: new Date(),
      location,
      notes
    });
    order.tracking = tracking;
    
    // Update actual delivery time if delivered
    if (status === 'delivered') {
      order.actual_delivery_time = new Date();
    }
    
    await order.save();
    
    // Emit notification to customer
    emitToUser(order.customer_id, 'notification', {
      type: 'delivery_update',
      title: 'Delivery Update',
      message: `Your order has been ${status.replace('_', ' ')}`,
      orderId: order.id,
      status: status
    });
    
    // Emit to order room for real-time updates
    emitToOrderRoom(order.id, 'orderStatusUpdated', { orderId: order.id, status });
    
    // If order is delivered, update delivery person availability
    if (status === 'delivered') {
      const user = await User.findByPk(req.user.id);
      user.delivery_person_profile.isAvailable = true;
      user.delivery_person_profile.totalDeliveries = (user.delivery_person_profile.totalDeliveries || 0) + 1;
      await user.save();
      
      // Update delivery person's rating if order was rated
      if (order.rating && order.rating.delivery) {
        await updateDeliveryPersonRating(req.user.id);
      }
      
      // Emit notification about completion
      emitToUser(order.customer_id, 'notification', {
        type: 'delivery_completed',
        title: 'Delivery Completed',
        message: 'Your order has been successfully delivered!',
        orderId: order.id
      });
    }
    
    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get delivery person's orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Build query
    const whereClause = {
      delivery_person_id: req.user.id
    };
    
    if (status) {
      whereClause.status = status;
    }
    
    const orders = await Order.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    const count = await Order.count({ where: whereClause });
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update delivery person location
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Update user location
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Initialize delivery_person_profile if it doesn't exist
    if (!user.delivery_person_profile) {
      user.delivery_person_profile = {};
    }
    
    user.delivery_person_profile.currentLocation = { lat, lng };
    await user.save();
    
    // Broadcast location update via socket (if implemented)
    // This would typically be handled by the socket service
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { location: { lat, lng } }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Decline order for delivery
export const declineOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    // Find order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is ready for pickup (available orders)
    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is not available for pickup'
      });
    }
    
    // Add tracking information
    const tracking = order.tracking || [];
    tracking.push({
      status: 'declined',
      timestamp: new Date(),
      notes: `Order declined by ${req.user.getFullName()}`
    });
    order.tracking = tracking;
    
    // Save the order without assigning it
    await order.save();
    
    res.json({
      success: true,
      message: 'Order declined successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Decline order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get delivery orders (for frontend)
export const getDeliveryOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    let orders;
    
    if (status === 'available') {
      // Get available orders for delivery
      // First get the delivery person's vehicle type
      const deliveryPerson = await User.findByPk(req.user.id);
      const deliveryPersonVehicleType = deliveryPerson.delivery_person_profile?.vehicleType;
      
      // Build query with vehicle type filter if delivery person has a vehicle
      const whereClause = {
        status: 'ready'
      };
      
      // If delivery person has a vehicle, filter orders by preferred vehicle type
      if (deliveryPersonVehicleType) {
        whereClause[Op.or] = [
          { preferred_vehicle_type: deliveryPersonVehicleType },
          { preferred_vehicle_type: null }
        ];
      }
      
      orders = await Order.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });
    } else {
      // Get orders assigned to this delivery person
      orders = await Order.findAll({
        where: {
          delivery_person_id: req.user.id
        },
        order: [['created_at', 'DESC']]
      });
    }
    
    res.json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get delivery statistics and earnings
export const getDeliveryStats = async (req, res) => {
  try {
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get today's deliveries
    const todayDeliveries = await Order.count({
      where: {
        delivery_person_id: userId,
        status: 'delivered',
        updated_at: {
          [Op.gte]: startOfDay
        }
      }
    });
    
    // Get today's earnings
    const todayOrders = await Order.findAll({
      where: {
        delivery_person_id: userId,
        status: 'delivered',
        updated_at: {
          [Op.gte]: startOfDay
        }
      }
    });
    
    const todayEarnings = todayOrders.reduce((sum, order) => {
      return sum + (order.pricing?.deliveryFee || 0);
    }, 0);
    
    // Get weekly earnings
    const weeklyOrders = await Order.findAll({
      where: {
        delivery_person_id: userId,
        status: 'delivered',
        updated_at: {
          [Op.gte]: startOfWeek
        }
      }
    });
    
    const weeklyEarnings = weeklyOrders.reduce((sum, order) => {
      return sum + (order.pricing?.deliveryFee || 0);
    }, 0);
    
    // Get total deliveries
    const totalDeliveries = await Order.count({
      where: {
        delivery_person_id: userId,
        status: 'delivered'
      }
    });
    
    // Get user rating
    const user = await User.findByPk(userId);
    const rating = user.delivery_person_profile?.rating || 0;
    
    res.json({
      success: true,
      data: {
        todayDeliveries,
        todayEarnings,
        weeklyEarnings,
        rating,
        totalDeliveries
      }
    });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get optimized delivery route
export const getDeliveryRoute = async (req, res) => {
  try {
    // Only delivery persons can access this
    if (req.user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    
    const { orderId } = req.params;
    
    // Get the order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is assigned to this delivery person
    if (order.delivery_person_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Order not assigned to you'
      });
    }
    
    // Get delivery person's current location
    const user = await User.findByPk(req.user.id);
    const currentLocation = user.delivery_person_profile?.currentLocation;
    
    if (!currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'Current location not available'
      });
    }
    
    // Get restaurant location (from business)
    const business = await Business.findByPk(order.business_id);
    const restaurantLocation = business?.address?.coordinates;
    
    if (!restaurantLocation) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant location not available'
      });
    }
    
    // Get customer delivery location
    const customerLocation = order.delivery_address?.coordinates;
    
    if (!customerLocation) {
      return res.status(400).json({
        success: false,
        message: 'Customer delivery location not available'
      });
    }
    
    // Create route with waypoints
    // In a real implementation, this would use a mapping service API like Google Maps Directions API
    // For now, we'll return a simple route structure
    const route = {
      waypoints: [
        {
          name: 'Current Location',
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          type: 'current'
        },
        {
          name: business.name || 'Restaurant',
          lat: restaurantLocation.lat,
          lng: restaurantLocation.lng,
          type: 'pickup'
        },
        {
          name: 'Customer Delivery',
          lat: customerLocation.lat,
          lng: customerLocation.lng,
          type: 'delivery'
        }
      ],
      totalDistance: 0, // Would be calculated with a real mapping service
      estimatedTime: 0, // Would be calculated with a real mapping service
      optimized: true
    };
    
    res.json({
      success: true,
      data: { route }
    });
  } catch (error) {
    console.error('Get delivery route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};