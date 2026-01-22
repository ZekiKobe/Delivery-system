import express from 'express';
import {
  getDashboardOverview,
  getBusinessOrders,
  updateOrderStatus,
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  duplicateMenuItem,
  bulkUpdateMenuItems,
  toggleMenuItemAvailability,
  getMenuCategories,
  getBusinessAnalytics,
  updateBusinessInfo,
  toggleBusinessStatus
} from '../controllers/businessDashboardController.js';
import { authenticate, businessOwnerAccess } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(businessOwnerAccess);

/**
 * Dashboard Overview Routes
 */

// GET /api/dashboard - Get dashboard overview
router.get('/', getDashboardOverview);

// POST /api/dashboard/toggle-status - Toggle business open/closed status
router.post('/toggle-status', toggleBusinessStatus);

/**
 * Order Management Routes
 */

// GET /api/dashboard/orders - Get business orders with filtering
router.get('/orders',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
      return validStatuses.includes(value) || 'Invalid order status';
    }),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('search').optional().custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      if (value.length < 1 || value.length > 200) return 'Search term must be between 1 and 200 characters';
      return true;
    })
  ],
  getBusinessOrders
);

// PUT /api/dashboard/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status',
  [
    param('orderId').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled']).withMessage('Invalid order status'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
  ],
  updateOrderStatus
);

/**
 * Menu/Product Management Routes
 */

// GET /api/dashboard/menu - Get menu items with filtering
router.get('/menu',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      if (value.length < 1 || value.length > 100) return 'Category must be between 1 and 100 characters';
      return true;
    }),
    query('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
    query('search').optional().custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      if (value.length < 1 || value.length > 200) return 'Search term must be between 1 and 200 characters';
      return true;
    })
  ],
  getMenuItems
);

// GET /api/dashboard/menu/categories - Get menu categories
router.get('/menu/categories', getMenuCategories);

// GET /api/dashboard/menu/:itemId - Get single menu item
router.get('/menu/:itemId',
  [
    param('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],
  getMenuItem
);

// POST /api/dashboard/menu - Create new menu item
router.post('/menu',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Menu item name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 5, max: 1000 })
      .withMessage('Description must be between 5 and 1000 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('preparationTime')
      .optional()
      .isInt({ min: 1, max: 480 })
      .withMessage('Preparation time must be between 1 and 480 minutes'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
    body('ingredients')
      .optional()
      .isArray()
      .withMessage('Ingredients must be an array'),
    body('allergens')
      .optional()
      .isArray()
      .withMessage('Allergens must be an array'),
    body('allergens.*')
      .optional()
      .isIn(['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 'fish', 'sesame', 'none'])
      .withMessage('Invalid allergen'),
    body('dietary')
      .optional()
      .isArray()
      .withMessage('Dietary options must be an array'),
    body('dietary.*')
      .optional()
      .isIn(['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'organic', 'none'])
      .withMessage('Invalid dietary option'),
    body('isAvailable')
      .optional()
      .isBoolean()
      .withMessage('isAvailable must be a boolean'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
    body('sku')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('SKU must be between 1 and 50 characters'),
    body('weight')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Weight must be a positive number'),
    body('dimensions')
      .optional()
      .isObject()
      .withMessage('Dimensions must be an object'),
    body('dimensions.length')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Length must be a positive number'),
    body('dimensions.width')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Width must be a positive number'),
    body('dimensions.height')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Height must be a positive number'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 30 })
      .withMessage('Each tag must be between 1 and 30 characters')
  ],
  createMenuItem
);

// PUT /api/dashboard/menu/:itemId - Update menu item
router.put('/menu/:itemId',
  [
    param('itemId').isMongoId().withMessage('Invalid menu item ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('preparationTime')
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage('Preparation time must be between 5 and 120 minutes'),
    body('images')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one image is required'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
    body('allergens.*')
      .optional()
      .isIn(['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 'fish', 'sesame'])
      .withMessage('Invalid allergen'),
    body('dietary.*')
      .optional()
      .isIn(['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free'])
      .withMessage('Invalid dietary option'),
    body('isSpicy')
      .optional()
      .isBoolean()
      .withMessage('isSpicy must be a boolean'),
    body('spiceLevel')
      .optional()
      .isInt({ min: 0, max: 5 })
      .withMessage('Spice level must be between 0 and 5')
  ],
  updateMenuItem
);

// DELETE /api/dashboard/menu/:itemId - Delete menu item
router.delete('/menu/:itemId',
  [
    param('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],
  deleteMenuItem
);

// PATCH /api/dashboard/menu/:itemId/toggle - Toggle menu item availability
router.patch('/menu/:itemId/toggle',
  [
    param('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],
  toggleMenuItemAvailability
);

/**
 * Analytics Routes
 */

// GET /api/dashboard/analytics - Get business analytics
router.get('/analytics',
  [
    query('period').optional().isIn(['1d', '7d', '30d', '90d']).withMessage('Invalid period. Must be 1d, 7d, 30d, or 90d')
  ],
  getBusinessAnalytics
);

/**
 * Business Information Routes
 */

// PUT /api/dashboard/business - Update business information
router.put('/business',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('contact.phone')
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('contact.email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email address'),
    body('contact.website')
      .optional()
      .trim()
      .isURL()
      .withMessage('Invalid website URL'),
    body('address.street')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Street address cannot be empty'),
    body('address.city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City cannot be empty'),
    body('address.state')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('State cannot be empty'),
    body('address.zipCode')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Zip code cannot be empty'),
    body('address.coordinates.lat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('address.coordinates.lng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('deliveryInfo.deliveryRadius')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Delivery radius must be between 1 and 50 km'),
    body('deliveryInfo.minimumOrder')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be a positive number'),
    body('deliveryInfo.deliveryFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Delivery fee must be a positive number'),
    body('deliveryInfo.freeDeliveryThreshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free delivery threshold must be a positive number'),
    body('deliveryInfo.estimatedDeliveryTime.min')
      .optional()
      .isInt({ min: 10 })
      .withMessage('Minimum delivery time must be at least 10 minutes'),
    body('deliveryInfo.estimatedDeliveryTime.max')
      .optional()
      .isInt({ min: 15 })
      .withMessage('Maximum delivery time must be at least 15 minutes'),
    body('settings.preparationTime')
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage('Preparation time must be between 5 and 120 minutes'),
    body('settings.maxOrdersPerHour')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Max orders per hour must be between 1 and 100'),
    body('settings.specialInstructions')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Special instructions cannot exceed 200 characters'),
    body('operatingHours')
      .optional()
      .isArray()
      .withMessage('Operating hours must be an array'),
    body('operatingHours.*.day')
      .optional()
      .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
      .withMessage('Invalid day'),
    body('operatingHours.*.isOpen')
      .optional()
      .isBoolean()
      .withMessage('isOpen must be a boolean'),
    body('operatingHours.*.openTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format. Use HH:MM'),
    body('operatingHours.*.closeTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format. Use HH:MM')
  ],
  updateBusinessInfo
);

// POST /api/dashboard/menu/:itemId/duplicate - Duplicate menu item
router.post('/menu/:itemId/duplicate',
  [
    param('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],
  duplicateMenuItem
);

// PATCH /api/dashboard/menu/bulk-update - Bulk update menu items
router.patch('/menu/bulk-update',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items array is required with at least one item'),
    body('items.*.id')
      .isMongoId()
      .withMessage('Each item must have a valid ID'),
    body('items.*.updates')
      .isObject()
      .withMessage('Each item must have an updates object')
  ],
  bulkUpdateMenuItems
);

export default router;