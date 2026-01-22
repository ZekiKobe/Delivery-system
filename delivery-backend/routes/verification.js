import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getVerificationStatus,
  requestVerificationReview as submitForReview
} from '../controllers/verificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Business Owner Routes

/**
 * POST /api/verification/initiate - Initiate verification process - Not implemented yet
 */
// router.post('/initiate',
//   authorize(['business_owner']),
//   initiateVerification
// );

/**
 * GET /api/verification/status - Get verification status
 */
router.get('/status',
  authorize(['business_owner']),
  getVerificationStatus
);

/**
 * GET /api/verification/required-documents - Get required documents list - Not implemented yet
 */
// router.get('/required-documents',
//   authorize(['business_owner']),
//   getRequiredDocuments
// );

/**
 * PUT /api/verification/business-info - Update business information - Not implemented yet
 */
// router.put('/business-info',
//   authorize(['business_owner']),
//   [
//     body('registrationNumber')
//       .optional()
//       .trim()
//       .isLength({ min: 3, max: 50 })
//       .withMessage('Registration number must be between 3 and 50 characters'),
//     body('taxId')
//       .optional()
//       .trim()
//       .isLength({ min: 3, max: 50 })
//       .withMessage('Tax ID must be between 3 and 50 characters'),
//     body('establishedYear')
//       .optional()
//       .isInt({ min: 1900, max: new Date().getFullYear() })
//       .withMessage('Invalid established year'),
//     body('employeeCount')
//       .optional()
//       .isIn(['1-5', '6-20', '21-50', '51-100', '100+'])
//       .withMessage('Invalid employee count range'),
//     body('monthlyRevenue')
//       .optional()
//       .isIn(['0-1000', '1000-5000', '5000-20000', '20000-50000', '50000+'])
//       .withMessage('Invalid monthly revenue range')
//   ],
//   updateBusinessInfo
// );

/**
 * POST /api/verification/upload-document - Upload verification document - Not implemented yet
 */
// router.post('/upload-document',
//   authorize(['business_owner']),
//   upload.single('document'),
//   [
//     body('documentType')
//       .isIn([
//         'business_license',
//         'tax_certificate',
//         'food_safety_certificate',
//         'pharmacy_license',
//         'trade_license',
//         'insurance_certificate',
//         'bank_statement',
//         'identity_document',
//         'address_proof',
//         'other'
//       ])
//       .withMessage('Invalid document type'),
//     body('isRequired')
//       .optional()
//       .isBoolean()
//       .withMessage('isRequired must be boolean')
//   ],
//   uploadVerificationDocuments
// );

/**
 * PUT /api/verification/bank-details - Update bank details - Not implemented yet
 */
// router.put('/bank-details',
//   authorize(['business_owner']),
//   [
//     body('accountHolder')
//       .trim()
//       .notEmpty()
//       .withMessage('Account holder name is required')
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Account holder name must be between 2 and 100 characters'),
//     body('accountNumber')
//       .trim()
//       .notEmpty()
//       .withMessage('Account number is required')
//       .isLength({ min: 8, max: 20 })
//       .withMessage('Account number must be between 8 and 20 characters'),
//     body('bankName')
//       .trim()
//       .notEmpty()
//       .withMessage('Bank name is required')
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Bank name must be between 2 and 100 characters'),
//     body('routingNumber')
//       .optional()
//       .trim()
//       .isLength({ min: 6, max: 15 })
//       .withMessage('Routing number must be between 6 and 15 characters')
//   ],
//   updateBankDetails
// );

/**
 * POST /api/verification/submit - Submit verification for review
 */
router.post('/submit',
  authorize(['business_owner']),
  submitForReview
);

/**
 * POST /api/verification/respond/:requestId - Respond to additional info request - Not implemented yet
 */
// router.post('/respond/:requestId',
//   authorize(['business_owner']),
//   [
//     param('requestId').isMongoId().withMessage('Invalid request ID'),
//     body('message')
//       .trim()
//       .notEmpty()
//       .withMessage('Response message is required')
//       .isLength({ min: 10, max: 1000 })
//       .withMessage('Message must be between 10 and 1000 characters'),
//     body('documents')
//       .optional()
//       .isArray()
//       .withMessage('Documents must be an array')
//   ],
//   respondToAdditionalInfoRequest
// );

// Admin Routes

/**
 * GET /api/verification/applications - Get all verification applications (Admin) - Not implemented yet
 */
// router.get('/applications',
//   authorize(['admin']),
//   [
//     query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
//     query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
//     query('status').optional().isIn(['all', 'draft', 'submitted', 'under_review', 'additional_info_required', 'approved', 'rejected', 'suspended']).withMessage('Invalid status filter'),
//     query('priority').optional().isIn(['all', 'low', 'normal', 'high', 'urgent']).withMessage('Invalid priority filter'),
//     query('businessType').optional().trim(),
//     query('sortBy').optional().isIn(['submittedAt', 'priority', 'overallStatus']).withMessage('Invalid sort field'),
//     query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
//   ],
//   getAllVerificationApplications
// );

/**
 * POST /api/verification/:verificationId/review - Review verification application (Admin) - Not implemented yet
 */
// router.post('/:verificationId/review',
//   authorize(['admin']),
//   [
//     param('verificationId').isMongoId().withMessage('Invalid verification ID'),
//     body('status')
//       .isIn(['approved', 'rejected', 'additional_info_required'])
//       .withMessage('Invalid review status'),
//     body('comments')
//       .optional()
//       .trim()
//       .isLength({ max: 1000 })
//       .withMessage('Comments cannot exceed 1000 characters'),
//     body('changesRequested')
//       .optional()
//       .isArray()
//       .withMessage('Changes requested must be an array'),
//     body('documentReviews')
//       .optional()
//       .isArray()
//       .withMessage('Document reviews must be an array'),
//     body('documentReviews.*.documentId')
//       .optional()
//       .isMongoId()
//       .withMessage('Invalid document ID'),
//     body('documentReviews.*.status')
//       .optional()
//       .isIn(['approved', 'rejected'])
//       .withMessage('Invalid document status')
//   ],
//   reviewVerificationApplication
// );

/**
 * POST /api/verification/:verificationId/assign - Assign reviewer (Admin) - Not implemented yet
 */
// router.post('/:verificationId/assign',
//   authorize(['admin']),
//   [
//     param('verificationId').isMongoId().withMessage('Invalid verification ID'),
//     body('reviewerId')
//       .isMongoId()
//       .withMessage('Invalid reviewer ID')
//   ],
//   assignReviewer
// );

/**
 * POST /api/verification/:verificationId/request-info - Request additional info (Admin) - Not implemented yet
 */
// router.post('/:verificationId/request-info',
//   authorize(['admin']),
//   [
//     param('verificationId').isMongoId().withMessage('Invalid verification ID'),
//     body('message')
//       .trim()
//       .notEmpty()
//       .withMessage('Message is required')
//       .isLength({ min: 10, max: 1000 })
//       .withMessage('Message must be between 10 and 1000 characters'),
//     body('documentsRequested')
//       .optional()
//       .isArray()
//       .withMessage('Documents requested must be an array'),
//     body('dueDate')
//       .optional()
//       .isISO8601()
//       .withMessage('Invalid due date format')
//   ],
//   requestAdditionalInfo
// );

/**
 * GET /api/verification/statistics - Get verification statistics (Admin) - Not implemented yet
 */
// router.get('/statistics',
//   authorize(['admin']),
//   getVerificationStatistics
// );

export default router;
