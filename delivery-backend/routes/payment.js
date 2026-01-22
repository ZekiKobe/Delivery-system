import express from 'express';
import {
  processPayment as createOrderPayment,
  refundPayment as processRefund
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Webhook route (no authentication required) - Not implemented yet
// router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// All other routes require authentication
router.use(authenticate);

// Payment processing routes
router.post('/orders/:orderId/pay', authorize('customer'), createOrderPayment);
// router.post('/confirm', confirmPayment); - Not implemented yet
router.post('/orders/:orderId/refund', authorize('customer', 'admin'), processRefund);

// Payment method management - Not implemented yet
// router.get('/methods', getPaymentMethods);
// router.post('/methods/setup', createPaymentMethodSetup);
// router.delete('/methods/:paymentMethodId', removePaymentMethod);

export default router;