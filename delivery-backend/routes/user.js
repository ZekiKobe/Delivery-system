import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePreferences,
  deleteAccount,
  getUserActivity,
  verifyPhone
} from '../controllers/userController.js';
import {
  validateUpdateProfile,
  validateChangePassword,
  validateAddress,
  validateUpdateAddress,
  validateUpdatePreferences,
  validateDeleteAccount,
  validatePhoneVerification
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.post('/avatar', uploadSingle('avatar'), handleMulterError, uploadAvatar);
router.put('/change-password', validateChangePassword, changePassword);
router.get('/activity', getUserActivity);
router.post('/verify-phone', validatePhoneVerification, verifyPhone);

// Address routes
router.post('/addresses', validateAddress, addAddress);
router.put('/addresses/:addressId', validateUpdateAddress, updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Preferences routes
router.put('/preferences', validateUpdatePreferences, updatePreferences);

// Account management
router.delete('/account', validateDeleteAccount, deleteAccount);

export default router;