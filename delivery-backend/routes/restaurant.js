import express from 'express';
import { param } from 'express-validator';
import {
  getAllRestaurants as getRestaurants,
  getRestaurantById as getRestaurant
} from '../controllers/restaurantController.js';
// import { createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/businessDashboardController.js';
import { authenticate, authorize, optional } from '../middleware/auth.js';
import { uploadFields, uploadMultiple, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optional, getRestaurants);
router.get('/:restaurantId', 
  [
    param('restaurantId').isInt().withMessage('Invalid restaurant ID')
  ],
  getRestaurant
);
// router.get('/:restaurantId/menu', getRestaurantMenu); // Not implemented yet

// Restaurant owner routes are not implemented yet

// Menu management routes - Not implemented yet
// router.post('/:restaurantId/menu', 
//   authenticate, 
//   authorize('restaurant_owner', 'admin'),
//   uploadMultiple('images', 3),
//   handleMulterError,
//   createMenuItem
// );

// router.put('/:restaurantId/menu/:itemId', 
//   authenticate, 
//   authorize('restaurant_owner', 'admin'),
//   uploadMultiple('images', 3),
//   handleMulterError,
//   updateMenuItem
// );

// router.delete('/:restaurantId/menu/:itemId', 
//   authenticate, 
//   authorize('restaurant_owner', 'admin'),
//   deleteMenuItem
// );

export default router;