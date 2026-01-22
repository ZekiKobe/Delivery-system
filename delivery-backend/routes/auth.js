import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  validateTwoFactorSetup,
  validateTwoFactorDisable
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

// Two-factor authentication routes
router.post('/2fa/setup', authenticate, enableTwoFactor);
router.post('/2fa/verify', authenticate, validateTwoFactorSetup, verifyTwoFactor);
router.post('/2fa/disable', authenticate, validateTwoFactorDisable, disableTwoFactor);

export default router;