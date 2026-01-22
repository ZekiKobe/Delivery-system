import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  getBusinessById as getBusinessProducts
} from '../controllers/businessController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get business products
router.get('/:businessId/products',
  [
    param('businessId').isMongoId().withMessage('Invalid business ID'),
    query('category').optional().trim(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ],
  getBusinessProducts
);

// Get product categories for a business - Not implemented yet
// router.get('/:businessId/products/categories',
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID')
//   ],
//   getProductCategories
// );

// Add product (business owner only) - Not implemented yet
// router.post('/:businessId/products',
//   authorize(['business_owner']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     body('name')
//       .trim()
//       .notEmpty()
//       .withMessage('Product name is required')
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Product name must be between 2 and 100 characters'),
//     body('description')
//       .trim()
//       .notEmpty()
//       .withMessage('Description is required')
//       .isLength({ min: 10, max: 500 })
//       .withMessage('Description must be between 10 and 500 characters'),
//     body('price')
//       .isFloat({ min: 0 })
//       .withMessage('Price must be a positive number'),
//     body('category')
//       .trim()
//       .notEmpty()
//       .withMessage('Category is required'),
//     body('preparationTime')
//       .isInt({ min: 5, max: 120 })
//       .withMessage('Preparation time must be between 5 and 120 minutes')
//   ],
//   addProduct
// );

// Update product (business owner only) - Not implemented yet
// router.put('/:businessId/products/:productId',
//   authorize(['business_owner']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     param('productId').isMongoId().withMessage('Invalid product ID'),
//     body('name')
//       .optional()
//       .trim()
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Product name must be between 2 and 100 characters'),
//     body('price')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Price must be a positive number'),
//     body('preparationTime')
//       .optional()
//       .isInt({ min: 5, max: 120 })
//       .withMessage('Preparation time must be between 5 and 120 minutes')
//   ],
//   updateProduct
// );

// Delete product (business owner only) - Not implemented yet
// router.delete('/:businessId/products/:productId',
//   authorize(['business_owner']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     param('productId').isMongoId().withMessage('Invalid product ID')
//   ],
//   deleteProduct
// );

export default router;