import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createProduct,
  getBusinessProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  bulkUpdateProducts,
  createCategory,
  getBusinessCategories,
  updateCategory,
  deleteCategory,
  getProductAnalytics,
  importProducts,
  exportProducts,
  getProductInsights
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Product validation middleware
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('preparationTime')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Preparation time must be between 5 and 120 minutes'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('spiceLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spice level must be between 0 and 5'),
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  body('allergens.*')
    .optional()
    .isIn(['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 'fish', 'sesame'])
    .withMessage('Invalid allergen type'),
  body('dietary')
    .optional()
    .isArray()
    .withMessage('Dietary must be an array'),
  body('dietary.*')
    .optional()
    .isIn(['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free'])
    .withMessage('Invalid dietary type')
];

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

// Business Products Routes

/**
 * GET /api/businesses/products - Get all products for authenticated business
 */
router.get('/products',
  authorize(['business_owner']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().trim(),
    query('search').optional().trim(),
    query('isAvailable').optional().isBoolean().withMessage('isAvailable must be true or false'),
    query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'orderCount', 'rating.average']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ],
  getBusinessProducts
);

/**
 * POST /api/businesses/products - Create new product
 */
router.post('/products',
  authorize(['business_owner']),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  productValidation,
  createProduct
);

/**
 * GET /api/businesses/products/:productId - Get single product
 */
router.get('/products/:productId',
  authorize(['business_owner']),
  [
    param('productId').isMongoId().withMessage('Invalid product ID')
  ],
  getProduct
);

/**
 * PUT /api/businesses/products/:productId - Update product
 */
router.put('/products/:productId',
  authorize(['business_owner']),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    ...productValidation.map(rule => rule.optional())
  ],
  updateProduct
);

/**
 * DELETE /api/businesses/products/:productId - Delete product
 */
router.delete('/products/:productId',
  authorize(['business_owner']),
  [
    param('productId').isMongoId().withMessage('Invalid product ID')
  ],
  deleteProduct
);

/**
 * PATCH /api/businesses/products/:productId/toggle - Toggle product availability
 */
router.patch('/products/:productId/toggle',
  authorize(['business_owner']),
  [
    param('productId').isMongoId().withMessage('Invalid product ID')
  ],
  toggleProductAvailability
);

/**
 * POST /api/businesses/products/bulk - Bulk operations on products
 */
router.post('/products/bulk',
  authorize(['business_owner']),
  [
    body('operation')
      .isIn(['enable', 'disable', 'delete', 'update'])
      .withMessage('Invalid operation type'),
    body('productIds')
      .isArray({ min: 1 })
      .withMessage('Product IDs array is required'),
    body('productIds.*')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('updateData')
      .optional()
      .isObject()
      .withMessage('Update data must be an object')
  ],
  bulkUpdateProducts
);

/**
 * GET /api/businesses/products/analytics - Get product analytics
 */
router.get('/products/analytics',
  authorize(['business_owner']),
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1 and 365 days')
  ],
  getProductAnalytics
);

/**
 * GET /api/businesses/products/insights - Get product insights and recommendations
 */
router.get('/products/insights',
  authorize(['business_owner']),
  getProductInsights
);

/**
 * POST /api/businesses/products/import - Import products from file
 */
router.post('/products/import',
  authorize(['business_owner']),
  upload.single('file'),
  importProducts
);

/**
 * GET /api/businesses/products/export - Export products to CSV
 */
router.get('/products/export',
  authorize(['business_owner']),
  exportProducts
);

// Category Management Routes

/**
 * GET /api/businesses/categories - Get all categories for business
 */
router.get('/categories',
  authorize(['business_owner']),
  getBusinessCategories
);

/**
 * POST /api/businesses/categories - Create new category
 */
router.post('/categories',
  authorize(['business_owner']),
  categoryValidation,
  createCategory
);

/**
 * PUT /api/businesses/categories/:categoryId - Update category
 */
router.put('/categories/:categoryId',
  authorize(['business_owner']),
  [
    param('categoryId').isMongoId().withMessage('Invalid category ID'),
    ...categoryValidation.map(rule => rule.optional())
  ],
  updateCategory
);

/**
 * DELETE /api/businesses/categories/:categoryId - Delete category
 */
router.delete('/categories/:categoryId',
  authorize(['business_owner']),
  [
    param('categoryId').isMongoId().withMessage('Invalid category ID')
  ],
  deleteCategory
);

export default router;
