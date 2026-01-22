import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize, adminOnly } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateBusinessRegistration,
  verifyDocuments,
  initiateBackgroundCheck,
  verifyBusiness,
  getVerificationRequirements,
  checkVerificationStatus
} from '../services/validationService.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Public routes - Get verification requirements
router.get('/requirements/:role',
  [
    param('role').isIn(['customer', 'delivery_person', 'business_owner', 'admin']).withMessage('Invalid role'),
    query('businessType').optional().isString().withMessage('Business type must be a string')
  ],
  async (req, res) => {
    try {
      const { role } = req.params;
      const { businessType } = req.query;

      const requirements = getVerificationRequirements(role, businessType);

      res.json({
        success: true,
        data: requirements
      });

    } catch (error) {
      console.error('Get requirements error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Protected routes
router.use(authenticate);

// Validate user registration data
router.post('/user-registration',
  [
    body('userData').isObject().withMessage('User data is required'),
    body('role').isIn(['customer', 'delivery_person', 'business_owner']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userData, role } = req.body;

      const validation = await validateUserRegistration(userData, role);

      res.json({
        success: true,
        data: validation
      });

    } catch (error) {
      console.error('Validate user registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }
  }
);

// Validate business registration data
router.post('/business-registration',
  authorize(['business_owner', 'admin']),
  [
    body('businessData').isObject().withMessage('Business data is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { businessData } = req.body;

      const validation = await validateBusinessRegistration(businessData);

      res.json({
        success: true,
        data: validation
      });

    } catch (error) {
      console.error('Validate business registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }
  }
);

// Check user verification status
router.get('/status/:userId?',
  async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;

      // Check if user is requesting their own status or is admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const status = await checkVerificationStatus(userId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Check verification status error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Submit documents for verification
router.post('/documents/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('documentType').isIn(['identity', 'license', 'business', 'other']).withMessage('Invalid document type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { documentType } = req.body;

      // Check if user is submitting their own documents or is admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Documents would be uploaded via the upload service
      const documents = req.files || {};

      const result = await verifyDocuments(userId, documents, documentType);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Submit documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Initiate background check (delivery persons only)
router.post('/background-check/:userId',
  authorize(['delivery_person', 'admin']),
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Check if user is requesting their own background check or is admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const personalInfo = req.body;
      const result = await initiateBackgroundCheck(userId, personalInfo);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Initiate background check error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Admin routes
router.use('/admin', adminOnly);

// Verify business (admin only)
router.put('/admin/business/:businessId/verify',
  [
    param('businessId').isMongoId().withMessage('Invalid business ID'),
    body('status').isIn(['pending', 'under_review', 'verified', 'rejected']).withMessage('Invalid status'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { businessId } = req.params;
      const { status, notes } = req.body;

      const result = await verifyBusiness(businessId, req.user.id);

      res.json({
        success: true,
        message: 'Business verification updated',
        data: result
      });

    } catch (error) {
      console.error('Verify business error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Get all pending verifications (admin only)
router.get('/admin/pending',
  [
    query('type').optional().isIn(['users', 'businesses', 'documents', 'background']).withMessage('Invalid type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  async (req, res) => {
    try {
      const { type = 'all', page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      let pendingItems = [];

      if (type === 'all' || type === 'users') {
        const User = (await import('../models/User.js')).default;
        const pendingUsers = await User.find({
          $or: [
            { isEmailVerified: false },
            { isPhoneVerified: false },
            { 'deliveryPersonProfile.backgroundCheckStatus': 'pending' },
            { 'deliveryPersonProfile.documentVerificationStatus': 'pending' }
          ]
        })
        .select('firstName lastName email role createdAt')
        .skip(skip)
        .limit(parseInt(limit));

        pendingItems.push(...pendingUsers.map(user => ({
          type: 'user',
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          pendingActions: []
        })));
      }

      if (type === 'all' || type === 'businesses') {
        const Business = (await import('../models/Business.js')).default;
        const pendingBusinesses = await Business.find({
          verificationStatus: { $in: ['pending', 'under_review'] }
        })
        .populate('owner', 'firstName lastName email')
        .select('name businessType verificationStatus createdAt')
        .skip(skip)
        .limit(parseInt(limit));

        pendingItems.push(...pendingBusinesses.map(business => ({
          type: 'business',
          id: business._id,
          name: business.name,
          businessType: business.businessType,
          owner: business.owner,
          status: business.verificationStatus,
          createdAt: business.createdAt
        })));
      }

      // Sort by creation date
      pendingItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        data: {
          items: pendingItems,
          page: parseInt(page),
          limit: parseInt(limit),
          total: pendingItems.length
        }
      });

    } catch (error) {
      console.error('Get pending verifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Batch approve/reject verifications (admin only)
router.post('/admin/batch-update',
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.id').isMongoId().withMessage('Invalid item ID'),
    body('items.*.type').isIn(['user', 'business', 'document']).withMessage('Invalid item type'),
    body('items.*.action').isIn(['approve', 'reject']).withMessage('Invalid action'),
    body('items.*.notes').optional().isString().withMessage('Notes must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { items } = req.body;
      const results = [];

      for (const item of items) {
        try {
          let result;
          
          switch (item.type) {
            case 'business':
              result = await verifyBusiness(item.id, req.user.id);
              break;
            // Add other cases as needed
            default:
              result = { success: false, error: 'Unsupported item type' };
          }

          results.push({
            id: item.id,
            type: item.type,
            action: item.action,
            success: result.success,
            error: result.error
          });

        } catch (error) {
          results.push({
            id: item.id,
            type: item.type,
            action: item.action,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        success: true,
        message: `Batch update completed: ${successCount} successful, ${failCount} failed`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failCount
          }
        }
      });

    } catch (error) {
      console.error('Batch update error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;