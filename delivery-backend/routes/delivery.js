import express from 'express';
import {
  updateLocation as updateDeliveryLocation,
  getMyOrders as getOrderTracking,
  updateLocation as updateAvailability,
  getDeliveryOrders,
  declineOrder,
  getDeliveryStats,
  getDeliveryRoute
} from '../controllers/deliveryController.js';
import { calculateDeliveryEstimate } from '../controllers/deliveryEstimateController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { query } from 'express-validator';

const router = express.Router();

// Public route for delivery estimate (used by ecommerce)
router.get('/estimate',
  [
    query('business_id').isInt().withMessage('Valid business ID is required'),
    query('delivery_address').notEmpty().withMessage('Delivery address is required')
  ],
  calculateDeliveryEstimate
);

// All other routes require authentication
router.use(authenticate);

// Delivery person routes
router.post('/location', authorize('delivery_person'), updateDeliveryLocation);
router.get('/route/:orderId', authorize('delivery_person'), getDeliveryRoute);
router.put('/availability', authorize('delivery_person'), updateAvailability);

// Order tracking routes (accessible by customer and delivery person)
router.get('/orders/:orderId/tracking', getOrderTracking);

// New routes for delivery dashboard
router.get('/orders', authorize('delivery_person'), getDeliveryOrders);
router.post('/orders/:orderId/decline', authorize('delivery_person'), declineOrder);
router.get('/stats', authorize('delivery_person'), getDeliveryStats);

export default router;