import express from 'express';
// import {
//   getTermsByType,
//   getAllTermsTypes,
//   createTerms,
//   updateTerms,
//   getAllTerms,
//   deleteTerms,
//   getTermsHistory
// } from '../controllers/termsController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Public routes
// Get terms by type (general, customer, delivery_person, business_owner, privacy) - Not implemented yet
// router.get('/:type', getTermsByType);

// Get all available terms types - Not implemented yet
// router.get('/', getAllTermsTypes);

// Get terms history by type - Not implemented yet
// router.get('/:type/history', getTermsHistory);

// Admin routes
router.use('/admin', authenticate, adminOnly);

// Get all terms (admin only) - Not implemented yet
// router.get('/admin/all', getAllTerms);

// Create new terms - Not implemented yet
// router.post('/admin',
//   [
//     body('type')
//       .isIn(['general', 'customer', 'delivery_person', 'business_owner', 'privacy'])
//       .withMessage('Invalid terms type'),
//     body('title')
//       .trim()
//       .notEmpty()
//       .withMessage('Title is required'),
//     body('content')
//       .trim()
//       .notEmpty()
//       .withMessage('Content is required'),
//     body('sections')
//       .optional()
//       .isArray()
//       .withMessage('Sections must be an array'),
//     body('sections.*.title')
//       .if(body('sections').exists())
//       .trim()
//       .notEmpty()
//       .withMessage('Section title is required'),
//     body('sections.*.content')
//       .if(body('sections').exists())
//       .trim()
//       .notEmpty()
//       .withMessage('Section content is required'),
//     body('sections.*.order')
//       .if(body('sections').exists())
//       .isInt({ min: 1 })
//       .withMessage('Section order must be a positive integer'),
//     body('version')
//       .optional()
//       .trim()
//       .notEmpty()
//       .withMessage('Version cannot be empty'),
//     body('effectiveDate')
//       .optional()
//       .isISO8601()
//       .withMessage('Invalid effective date format')
//   ],
//   createTerms
// );

// Update terms - Not implemented yet
// router.put('/admin/:id',
//   [
//     body('title')
//       .optional()
//       .trim()
//       .notEmpty()
//       .withMessage('Title cannot be empty'),
//     body('content')
//       .optional()
//       .trim()
//       .notEmpty()
//       .withMessage('Content cannot be empty'),
//     body('sections')
//       .optional()
//       .isArray()
//       .withMessage('Sections must be an array'),
//     body('version')
//       .optional()
//       .trim()
//       .notEmpty()
//       .withMessage('Version cannot be empty')
//   ],
//   updateTerms
// );

// Delete terms (soft delete) - Not implemented yet
// router.delete('/admin/:id', deleteTerms);

export default router;