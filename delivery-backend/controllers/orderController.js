import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { emitToUser, emitToOrderRoom } from '../services/socketService.js';
import { verifyEcommerceOrder, notifyEcommerceDeliveryStatus } from '../services/ecommerceIntegrationService.js';
import logger from '../services/logger.js';

// Create a new delivery order from ecommerce
export const createDeliveryOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      ecommerce_order_id,
      ecommerce_order_number,
      customer_id,
      business_id,
      items,
      delivery_address,
      customer_notes,
      preferred_vehicle_type,
      scheduled_for
    } = req.body;

    // Validate required fields
    if (!ecommerce_order_id || !customer_id || !business_id || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ecommerce_order_id, customer_id, business_id, delivery_address'
      });
    }

    // Verify ecommerce order exists (optional - can be disabled for testing)
    if (process.env.VERIFY_ECOMMERCE_ORDER !== 'false') {
      const verification = await verifyEcommerceOrder(ecommerce_order_id);
      if (!verification.success) {
        logger.warn('Ecommerce order verification failed', {
          ecommerce_order_id,
          error: verification.error
        });
        // Continue anyway - might be a webhook call before order is fully created
      }
    }

    // Check if delivery order already exists for this ecommerce order
    const existingOrder = await Order.findOne({
      where: { ecommerce_order_id }
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: 'Delivery order already exists for this ecommerce order',
        data: { order: existingOrder }
      });
    }

    // Get business for delivery fee calculation
    const business = await Business.findByPk(business_id);
    if (!business || !business.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or inactive'
      });
    }

    // Calculate delivery fee (product pricing comes from ecommerce)
    const deliveryInfo = business.delivery_info || {};
    const deliveryFee = deliveryInfo.delivery_fee || deliveryInfo.deliveryFee || 0;
    
    // Calculate estimated delivery time
    const estimatedTime = deliveryInfo.estimated_delivery_time || { min: 30, max: 45 };
    const estimatedMinutes = estimatedTime.max || 45;
    const estimatedDeliveryTime = scheduled_for 
      ? new Date(scheduled_for)
      : new Date(Date.now() + estimatedMinutes * 60 * 1000);

    // Generate order number
    const orderNumber = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create delivery order
    const order = await Order.create({
      order_number: orderNumber,
      customer_id: parseInt(customer_id),
      business_id: parseInt(business_id),
      ecommerce_order_id: ecommerce_order_id.toString(),
      ecommerce_order_number: ecommerce_order_number || null,
      items: items || [], // Items reference from ecommerce
      status: 'pending',
      delivery_address: delivery_address,
      pricing: {
        // Product pricing handled by ecommerce, only delivery fee here
        deliveryFee: deliveryFee,
        note: 'Product pricing handled by ecommerce system'
      },
      payment: {
        method: 'handled_by_ecommerce',
        status: 'completed' // Payment handled by ecommerce
      },
      customer_notes: customer_notes || null,
      preferred_vehicle_type: preferred_vehicle_type || null,
      estimated_delivery_time: estimatedDeliveryTime,
      is_scheduled: !!scheduled_for,
      scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
      tracking: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Delivery order created from ecommerce'
      }]
    });

    logger.info('Delivery order created from ecommerce', {
      order_id: order.id,
      ecommerce_order_id,
      business_id,
      customer_id
    });

    // Notify ecommerce about delivery order creation
    if (process.env.NOTIFY_ECOMMERCE !== 'false') {
      await notifyEcommerceDeliveryStatus(ecommerce_order_id, 'pending', {
        delivery_order_id: order.id,
        delivery_order_number: orderNumber,
        estimated_delivery_time: estimatedDeliveryTime
      });
    }

    res.status(201).json({
      success: true,
      message: 'Delivery order created successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Create delivery order error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new order (legacy - kept for backward compatibility)
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, deliveryAddress, paymentMethod, customerNotes, preferredVehicleType } = req.body;
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate pricing
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    // Get business for delivery fee calculation
    const business = await Business.findByPk(items[0].restaurantId || items[0].business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const deliveryFee = business.delivery_info?.deliveryFee || business.delivery_info?.delivery_fee || 0;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + serviceFee + tax;

    // Generate order number
    const orderNumber = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      order_number: orderNumber,
      customer_id: req.user.id,
      business_id: items[0].restaurantId || items[0].business_id,
      items,
      status: 'pending',
      delivery_address: deliveryAddress,
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      customer_notes: customerNotes,
      preferred_vehicle_type: preferredVehicleType || null,
      estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Create order error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { page = 1, limit = 10, status, sort } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query
    const whereClause = {
      customer_id: req.user.id
    };
    
    if (status) {
      whereClause.status = status;
    }
    
    // Handle sorting
    let orderBy = [['created_at', 'DESC']];
    if (sort) {
      if (sort === '-createdAt' || sort === '-created_at') {
        orderBy = [['created_at', 'DESC']];
      } else if (sort === 'createdAt' || sort === 'created_at') {
        orderBy = [['created_at', 'ASC']];
      }
    }
    
    // Try to include business, but don't fail if association doesn't work
    let orders;
    try {
      orders = await Order.findAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orderBy,
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'business_type', 'images'],
            required: false // Left join - don't fail if business doesn't exist
          }
        ]
      });
    } catch (includeError) {
      // If include fails, try without it
      logger.warn('Failed to include business in orders query, trying without include', {
        error: includeError.message
      });
      orders = await Order.findAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orderBy
      });
    }
    
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
    logger.error('Get user orders error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      query: req.query
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findByPk(id);
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: 'customer',
      cancelledAt: new Date()
    };
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update order status (for delivery person and admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.status = status;
    
    // Add tracking information
    const tracking = order.tracking || [];
    tracking.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id
    });
    order.tracking = tracking;
    
    // Update actual delivery time if delivered
    if (status === 'delivered') {
      order.actual_delivery_time = new Date();
    }
    
    await order.save();

    // Notify ecommerce about status update if it's an ecommerce order
    if (order.ecommerce_order_id && process.env.NOTIFY_ECOMMERCE !== 'false') {
      await notifyEcommerceDeliveryStatus(order.ecommerce_order_id, status, {
        delivery_order_id: order.id,
        tracking: order.tracking,
        actual_delivery_time: order.actual_delivery_time
      });
    }
    
    // Emit notification to customer
    emitToUser(order.customer_id, 'notification', {
      type: 'order_update',
      title: 'Order Update',
      message: `Your order status has been updated to ${status}`,
      orderId: order.id,
      status: status
    });
    
    // Emit notification to delivery person if assigned
    if (order.delivery_person_id) {
      emitToUser(order.delivery_person_id, 'notification', {
        type: 'order_update',
        title: 'Order Update',
        message: `Order ${order.id} status updated to ${status}`,
        orderId: order.id,
        status: status
      });
    }
    
    // Emit to order room for real-time updates
    emitToOrderRoom(order.id, 'orderStatusUpdated', { orderId: order.id, status });
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get delivery orders for delivery person
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
      // Get available orders for delivery (ready status)
      orders = await Order.findAll({
        where: {
          status: 'ready'
        },
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

// Get order tracking
export const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { 
        tracking: order.tracking || [],
        status: order.status,
        estimatedDeliveryTime: order.estimated_delivery_time
      }
    });
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Rate order
export const rateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { foodRating, deliveryRating, comment } = req.body;
    
    const order = await Order.findByPk(id);
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered to rate'
      });
    }
    
    // Check if already rated
    if (order.rating) {
      return res.status(400).json({
        success: false,
        message: 'Order already rated'
      });
    }
    
    // Update order rating
    order.rating = {
      food: foodRating,
      delivery: deliveryRating,
      overall: (foodRating + deliveryRating) / 2,
      comment,
      ratedAt: new Date()
    };
    
    await order.save();
    
    // Update delivery person's overall rating
    if (order.delivery_person_id) {
      await updateDeliveryPersonRating(order.delivery_person_id);
    }
    
    res.json({
      success: true,
      message: 'Order rated successfully',
      data: { rating: order.rating }
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update delivery person's overall rating based on order ratings
export const updateDeliveryPersonRating = async (deliveryPersonId) => {
  try {
    // Get all rated orders for this delivery person
    const ratedOrders = await Order.findAll({
      where: {
        delivery_person_id: deliveryPersonId,
        status: 'delivered'
      }
    });
    
    // Filter orders that have ratings
    const ordersWithRatings = ratedOrders.filter(order => order.rating && order.rating.delivery);
    
    if (ordersWithRatings.length === 0) {
      return;
    }
    
    // Calculate average delivery rating
    const totalRating = ordersWithRatings.reduce((sum, order) => sum + order.rating.delivery, 0);
    const averageRating = totalRating / ordersWithRatings.length;
    
    // Update delivery person's profile with the new rating
    const deliveryPerson = await User.findByPk(deliveryPersonId);
    
    if (deliveryPerson && deliveryPerson.delivery_person_profile) {
      deliveryPerson.delivery_person_profile.rating = parseFloat(averageRating.toFixed(1));
      deliveryPerson.delivery_person_profile.totalRatings = ordersWithRatings.length;
      await deliveryPerson.save();
      
      // Emit rating update to the delivery person
      emitToUser(deliveryPersonId, 'ratingUpdated', {
        type: 'rating_update',
        title: 'Rating Updated',
        message: `Your rating has been updated to ${parseFloat(averageRating.toFixed(1))}`,
        rating: parseFloat(averageRating.toFixed(1))
      });
    }
  } catch (error) {
    console.error('Update delivery person rating error:', error);
  }
};