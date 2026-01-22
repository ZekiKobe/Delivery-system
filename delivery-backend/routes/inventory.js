import express from 'express';
import { body, param, query } from 'express-validator';
// import {
//   getInventoryOverview,
//   getProductInventory,
//   updateProductInventory,
//   adjustStock,
//   bulkAdjustStock,
//   getLowStockAlerts,
//   getInventoryAnalytics,
//   generateStockReport,
//   restockProduct,
//   getInventoryAlerts,
//   markExpiredProducts
// } from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication as business owner
router.use(authenticate);
router.use(authorize(['business_owner']));

/**
 * GET /api/inventory - Get inventory overview - Not implemented yet
 */
// router.get('/',
//   [
//     query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
//     query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
//     query('status').optional().isIn(['all', 'in_stock', 'low_stock', 'out_of_stock']).withMessage('Invalid status filter'),
//     query('search').optional().trim()
//   ],
//   getInventoryOverview
// );

/**
 * GET /api/inventory/alerts - Get inventory alerts - Not implemented yet
 */
// router.get('/alerts', getInventoryAlerts);

/**
 * GET /api/inventory/low-stock - Get low stock alerts - Not implemented yet
 */
// router.get('/low-stock', getLowStockAlerts);

/**
 * GET /api/inventory/analytics - Get inventory analytics - Not implemented yet
 */
// router.get('/analytics',
//   [
//     query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1 and 365 days')
//   ],
//   getInventoryAnalytics
// );

/**
 * GET /api/inventory/report - Generate inventory report - Not implemented yet
 */
// router.get('/report',
//   [
//     query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
//     query('includeHistory').optional().isBoolean().withMessage('Include history must be boolean')
//   ],
//   generateStockReport
// );

/**
 * GET /api/inventory/products/:productId - Get inventory for specific product - Not implemented yet
 */
// router.get('/products/:productId',
//   [
//     param('productId').isMongoId().withMessage('Invalid product ID')
//   ],
//   getProductInventory
// );

/**
 * PUT /api/inventory/products/:productId - Update product inventory - Not implemented yet
 */
// router.put('/products/:productId',
//   [
//     param('productId').isMongoId().withMessage('Invalid product ID'),
//     body('currentStock')
//       .optional()
//       .isInt({ min: 0 })
//       .withMessage('Current stock must be a non-negative integer'),
//     body('minimumStock')
//       .optional()
//       .isInt({ min: 0 })
//       .withMessage('Minimum stock must be a non-negative integer'),
//     body('maximumStock')
//       .optional()
//       .isInt({ min: 0 })
//       .withMessage('Maximum stock must be a non-negative integer'),
//     body('reorderPoint')
//       .optional()
//       .isInt({ min: 0 })
//       .withMessage('Reorder point must be a non-negative integer'),
//     body('costPrice')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Cost price must be a non-negative number'),
//     body('trackInventory')
//       .optional()
//       .isBoolean()
//       .withMessage('Track inventory must be boolean'),
//     body('allowBackorders')
//       .optional()
//       .isBoolean()
//       .withMessage('Allow backorders must be boolean'),
//     body('expirationDate')
//       .optional()
//       .isISO8601()
//       .withMessage('Invalid expiration date format'),
//     body('supplier.name')
//       .optional()
//       .trim()
//       .isLength({ max: 100 })
//       .withMessage('Supplier name cannot exceed 100 characters'),
//     body('supplier.email')
//       .optional()
//       .isEmail()
//       .withMessage('Invalid supplier email')
//   ],
//   updateProductInventory
// );

/**
 * PATCH /api/inventory/products/:productId/adjust - Adjust stock levels - Not implemented yet
 */
// router.patch('/products/:productId/adjust',
//   [
//     param('productId').isMongoId().withMessage('Invalid product ID'),
//     body('adjustment')
//       .isInt()
//       .withMessage('Adjustment must be an integer (positive for increase, negative for decrease)'),
//     body('reason')
//       .optional()
//       .trim()
//       .isLength({ max: 200 })
//       .withMessage('Reason cannot exceed 200 characters'),
//     body('costPrice')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Cost price must be a non-negative number')
//   ],
//   adjustStock
// );

/**
 * POST /api/inventory/products/:productId/restock - Restock product - Not implemented yet
 */
// router.post('/products/:productId/restock',
//   [
//     param('productId').isMongoId().withMessage('Invalid product ID'),
//     body('quantity')
//       .isInt({ min: 1 })
//       .withMessage('Quantity must be a positive integer'),
//     body('costPrice')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Cost price must be a non-negative number'),
//     body('reason')
//       .optional()
//       .trim()
//       .isLength({ max: 200 })
//       .withMessage('Reason cannot exceed 200 characters'),
//     body('supplier.name')
//       .optional()
//       .trim()
//       .isLength({ max: 100 })
//       .withMessage('Supplier name cannot exceed 100 characters')
//   ],
//   restockProduct
// );

/**
 * POST /api/inventory/bulk-adjust - Bulk stock adjustment - Not implemented yet
 */
// router.post('/bulk-adjust',
//   [
//     body('adjustments')
//       .isArray({ min: 1 })
//       .withMessage('Adjustments array is required'),
//     body('adjustments.*.productId')
//       .isMongoId()
//       .withMessage('Invalid product ID'),
//     body('adjustments.*.quantity')
//       .isInt()
//       .withMessage('Quantity must be an integer'),
//     body('reason')
//       .optional()
//       .trim()
//       .isLength({ max: 200 })
//       .withMessage('Reason cannot exceed 200 characters')
//   ],
//   bulkAdjustStock
// );

/**
 * POST /api/inventory/mark-expired - Mark products as expired - Not implemented yet
 */
// router.post('/mark-expired',
//   [
//     body('productIds')
//       .isArray({ min: 1 })
//       .withMessage('Product IDs array is required'),
//     body('productIds.*')
//       .isMongoId()
//       .withMessage('Invalid product ID'),
//     body('reason')
//       .optional()
//       .trim()
//       .isLength({ max: 200 })
//       .withMessage('Reason cannot exceed 200 characters')
//   ],
//   markExpiredProducts
// );

export default router;
