import express from 'express';
import {
  getAllBusinesses,
  getBusinessById as getBusiness,
  getFeaturedBusinesses,
  searchBusinesses,
  getBusinessProducts
} from '../controllers/businessController.js';
import { authenticate, authorize, adminOnly } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Public routes
// Get all businesses (with filtering and searching)
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('businessType').optional().isIn([
      'restaurant', 'grocery', 'pharmacy', 'electronics', 'clothing', 'books', 
      'flowers', 'gifts', 'furniture', 'hardware', 'pet_supplies', 'automotive',
      'beauty', 'sports', 'toys', 'medical', 'laundry', 'cleaning', 'catering',
      'office_supplies', 'alcohol', 'convenience', 'other'
    ]),
    query('latitude').optional().isFloat().withMessage('Invalid latitude'),
    query('longitude').optional().isFloat().withMessage('Invalid longitude'),
    query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
  ],
  getAllBusinesses
);

// Get featured businesses
router.get('/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
  ],
  getFeaturedBusinesses
);

// Search businesses by location - Not implemented yet
// router.get('/search/location',
//   [
//     query('latitude').notEmpty().isFloat().withMessage('Valid latitude is required'),
//     query('longitude').notEmpty().isFloat().withMessage('Valid longitude is required'),
//     query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km')
//   ],
//   searchBusinessesByLocation
// );

// Get business by ID
router.get('/:businessId',
  [
    param('businessId').isInt().withMessage('Invalid business ID')
  ],
  getBusiness
);

// Get business products/menu items (public)
router.get('/:businessId/products',
  [
    param('businessId').isInt().withMessage('Invalid business ID'),
    query('category').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getBusinessProducts
);

// Protected routes
router.use(authenticate);

// Get my business (business owner only) - Not implemented yet
// router.get('/my/business',
//   authorize(['business_owner', 'admin']),
//   getMyBusiness
// );

// Create business (business owner only) - Not implemented yet
// router.post('/',
//   (req, res, next) => {
//     console.log('Business creation route - User:', {
//       id: req.user._id,
//       role: req.user.role,
//       email: req.user.email,
//       businessProfile: req.user.businessProfile
//     });
//     console.log('Request headers:', req.headers);
//     console.log('Authorization header:', req.headers.authorization);
//     next();
//   },
//   authorize(['business_owner']),
//   [
//     body('name')
//       .trim()
//       .notEmpty()
//       .withMessage('Business name is required')
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Business name must be between 2 and 100 characters'),
//     body('description')
//       .trim()
//       .notEmpty()
//       .withMessage('Description is required')
//       .isLength({ min: 10, max: 500 })
//       .withMessage('Description must be between 10 and 500 characters'),
//     body('businessType')
//       .isIn([
//         'restaurant', 'grocery', 'pharmacy', 'electronics', 'clothing', 'books', 
//         'flowers', 'gifts', 'furniture', 'hardware', 'pet_supplies', 'automotive',
//         'beauty', 'sports', 'toys', 'medical', 'laundry', 'cleaning', 'catering',
//         'office_supplies', 'alcohol', 'convenience', 'other'
//       ])
//       .withMessage('Invalid business type'),
//     body('category')
//       .isArray({ min: 1 })
//       .withMessage('At least one category is required'),
//     body('address.street')
//       .trim()
//       .notEmpty()
//       .withMessage('Street address is required'),
//     body('address.city')
//       .trim()
//       .notEmpty()
//       .withMessage('City is required'),
//     body('address.state')
//       .trim()
//       .notEmpty()
//       .withMessage('State is required'),
//     body('address.zipCode')
//       .trim()
//       .notEmpty()
//       .withMessage('Zip code is required'),
//     body('address.coordinates.lat')
//       .optional()
//       .isFloat({ min: -90, max: 90 })
//       .withMessage('Valid latitude is required'),
//     body('address.coordinates.lng')
//       .optional()
//       .isFloat({ min: -180, max: 180 })
//       .withMessage('Valid longitude is required'),
//     body('contact.phone')
//       .trim()
//       .notEmpty()
//       .withMessage('Business phone is required'),
//     body('contact.email')
//       .trim()
//       .isEmail()
//       .withMessage('Valid business email is required'),
//     body('deliveryInfo.deliveryRadius')
//       .isInt({ min: 1, max: 50 })
//       .withMessage('Delivery radius must be between 1 and 50 km'),
//     body('deliveryInfo.minimumOrder')
//       .isFloat({ min: 0 })
//       .withMessage('Minimum order must be a positive number'),
//     body('deliveryInfo.deliveryFee')
//       .isFloat({ min: 0 })
//       .withMessage('Delivery fee must be a positive number'),
//     body('documents.businessLicense')
//       .optional()
//       .trim()
//       .isLength({ min: 0, max: 500 })
//       .withMessage('Business license must be less than 500 characters'),
//     body('documents.taxId')
//       .optional()
//       .trim()
//       .isLength({ min: 0, max: 500 })
//       .withMessage('Tax ID must be less than 500 characters'),
//     body('bankDetails.accountHolder')
//       .optional()
//       .trim()
//       .isLength({ min: 0, max: 100 })
//       .withMessage('Account holder name must be less than 100 characters'),
//     body('bankDetails.accountNumber')
//       .optional()
//       .trim()
//       .isLength({ min: 0, max: 50 })
//       .withMessage('Account number must be less than 50 characters'),
//     body('bankDetails.bankName')
//       .optional()
//       .trim()
//       .isLength({ min: 0, max: 100 })
//       .withMessage('Bank name must be less than 100 characters')
//   ],
//   createBusiness
// );

// Update business - Not implemented yet
// router.put('/:businessId',
//   authorize(['business_owner', 'admin']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     body('name')
//       .optional()
//       .trim()
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Business name must be between 2 and 100 characters'),
//     body('description')
//       .optional()
//       .trim()
//       .isLength({ min: 10, max: 500 })
//       .withMessage('Description must be between 10 and 500 characters'),
//     body('businessType')
//       .optional()
//       .isIn([
//         'restaurant', 'grocery', 'pharmacy', 'electronics', 'clothing', 'books', 
//         'flowers', 'gifts', 'furniture', 'hardware', 'pet_supplies', 'automotive',
//         'beauty', 'sports', 'toys', 'medical', 'laundry', 'cleaning', 'catering',
//         'office_supplies', 'alcohol', 'convenience', 'other'
//       ])
//       .withMessage('Invalid business type'),
//     body('address.coordinates.lat')
//       .optional()
//       .isFloat({ min: -90, max: 90 })
//       .withMessage('Valid latitude is required'),
//     body('address.coordinates.lng')
//       .optional()
//       .isFloat({ min: -180, max: 180 })
//       .withMessage('Valid longitude is required'),
//     body('contact.email')
//       .optional()
//       .trim()
//       .isEmail()
//       .withMessage('Valid email is required'),
//     body('deliveryInfo.deliveryRadius')
//       .optional()
//       .isInt({ min: 1, max: 50 })
//       .withMessage('Delivery radius must be between 1 and 50 km'),
//     body('deliveryInfo.minimumOrder')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Minimum order must be a positive number'),
//     body('deliveryInfo.deliveryFee')
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage('Delivery fee must be a positive number')
//   ],
//   updateBusiness
// );

// Delete business (soft delete) - Not implemented yet
// router.delete('/:businessId',
//   authorize(['business_owner', 'admin']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID')
//   ],
//   deleteBusiness
// );

// Get business analytics (owner only) - Not implemented yet
// router.get('/:businessId/analytics',
//   authorize(['business_owner', 'admin']),
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     query('period').optional().isIn(['1d', '7d', '30d', '90d']).withMessage('Invalid period')
//   ],
//   getBusinessAnalytics
// );

// Admin routes
router.use('/admin', adminOnly);

// Update business verification status (admin only) - Not implemented yet
// router.put('/admin/:businessId/status',
//   [
//     param('businessId').isMongoId().withMessage('Invalid business ID'),
//     body('status')
//       .isIn(['pending', 'under_review', 'verified', 'rejected'])
//       .withMessage('Invalid status'),
//     body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long')
//   ],
//   updateBusinessStatus
// );

export default router;