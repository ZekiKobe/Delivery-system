import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Process payment
export const processPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, paymentMethod, paymentData } = req.body;
    
    // Find order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if payment already processed
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }
    
    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway like Stripe
    const paymentResult = {
      success: true,
      transactionId: `txn_${Date.now()}`,
      paymentIntentId: `pi_${Date.now()}`
    };
    
    // Update order payment status
    order.payment.status = 'completed';
    order.payment.transactionId = paymentResult.transactionId;
    order.payment.paymentIntentId = paymentResult.paymentIntentId;
    
    // Update order status
    order.status = 'confirmed';
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { 
        order,
        transactionId: paymentResult.transactionId
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {
      customer_id: req.user.id,
      '$payment.status$': 'completed'
    };
    
    const orders = await Order.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    const count = await Order.count({ where: whereClause });
    
    const payments = orders.map(order => ({
      id: order.id,
      amount: order.pricing.total,
      method: order.payment.method,
      status: order.payment.status,
      transactionId: order.payment.transactionId,
      createdAt: order.created_at
    }));
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    
    // Find order
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to user
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if payment was completed
    if (order.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
    
    // Check if already refunded
    if (order.payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }
    
    // Simulate refund processing
    // In a real application, you would integrate with a payment gateway like Stripe
    const refundResult = {
      success: true,
      refundId: `refund_${Date.now()}`
    };
    
    // Update order payment status
    order.payment.status = 'refunded';
    order.payment.refundId = refundResult.refundId;
    
    // Update order status
    order.status = 'refunded';
    
    // Add refund information
    order.cancellation = {
      reason,
      cancelledBy: 'customer',
      cancelledAt: new Date(),
      refundAmount: order.pricing.total
    };
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: { 
        order,
        refundId: refundResult.refundId
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
