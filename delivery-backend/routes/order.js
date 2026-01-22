import express from 'express';
import {
  createOrder,
  createDeliveryOrder,
  getUserOrders,
  getOrderById as getOrder,
  cancelOrder,
  updateOrderStatus,
  getDeliveryOrders
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import logger from '../services/logger.js';

const router = express.Router();

// Public route for ecommerce integration (can be protected with API key)
// POST /api/orders/delivery/create - Create delivery order from ecommerce
router.post('/delivery/create',
  [
    body('ecommerce_order_id').notEmpty().withMessage('Ecommerce order ID is required'),
    body('customer_id').isInt().withMessage('Valid customer ID is required'),
    body('business_id').isInt().withMessage('Valid business ID is required'),
    body('delivery_address').isObject().withMessage('Delivery address is required'),
    body('delivery_address.street').optional().isString(),
    body('delivery_address.city').notEmpty().withMessage('City is required'),
    body('delivery_address.coordinates').optional().isObject(),
    body('items').optional().isArray(),
    body('ecommerce_order_number').optional().isString(),
    body('customer_notes').optional().isString().isLength({ max: 500 }),
    body('scheduled_for').optional().isISO8601().withMessage('Invalid date format')
  ],
  createDeliveryOrder
);

// Get delivery order by ecommerce order ID (public for ecommerce to check status)
router.get('/ecommerce/:ecommerceOrderId',
  [
    param('ecommerceOrderId').notEmpty().withMessage('Ecommerce order ID is required')
  ],
  async (req, res) => {
    try {
      const Order = (await import('../models/Order.js')).default;
      const order = await Order.findOne({
        where: { ecommerce_order_id: req.params.ecommerceOrderId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Delivery order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      logger.error('Get delivery order by ecommerce ID error', {
        error: error.message,
        ecommerceOrderId: req.params.ecommerceOrderId
      });
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// All other routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', authorize('customer'), createOrder);
router.get('/my-orders', authorize('customer'), getUserOrders);
router.get('/:orderId', getOrder);
router.put('/:orderId/cancel', authorize('customer'), cancelOrder);

// Restaurant owner routes - Not implemented yet
// router.get('/restaurant/orders', authorize('restaurant_owner'), getRestaurantOrders);

// Delivery person and admin routes
router.put('/:orderId/status', authorize('delivery_person', 'admin'), updateOrderStatus);
router.get('/delivery/orders', authorize('delivery_person'), getDeliveryOrders);

export default router;