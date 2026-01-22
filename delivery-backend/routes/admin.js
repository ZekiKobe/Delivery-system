import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
  getUserStatistics,
  bulkUpdateUsers,
  bulkDeleteUsers,
  getReferralStats,
  getReferredUsers
} from '../controllers/adminController.js';
import {
  validateUpdateUser,
  validateBulkOperation
} from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', validateUpdateUser, updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/activate', activateUser);

// Statistics
router.get('/statistics/users', getUserStatistics);

// Referral system
router.get('/users/:userId/referrals', getReferralStats);
router.get('/users/:userId/referred', getReferredUsers);

// Bulk operations
router.put('/users/bulk-update', validateBulkOperation, bulkUpdateUsers);
router.delete('/users/bulk-delete', validateBulkOperation, bulkDeleteUsers);

export default router;
