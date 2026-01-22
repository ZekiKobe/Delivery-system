import { body } from 'express-validator';

// Register validation
export const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('role')
    .optional()
    .isIn(['customer', 'business_owner', 'delivery_person'])
    .withMessage('Invalid role specified'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender specified')
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Two-factor code must be 6 digits')
];

// Forgot password validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Reset password validation
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Change password validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Refresh token validation
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Update profile validation
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('phone')
    .optional()
    .custom((value) => {
      // If phone is provided, validate it
      if (value) {
        // Allow empty strings to pass (they'll be ignored in the controller)
        if (value === '') {
          return true;
        }
        // Validate phone number format - more flexible pattern
        const phoneRegex = /^\+?[\d\s-()]+$/; // Allow digits, spaces, dashes, parentheses and optional +
        if (!phoneRegex.test(value)) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender specified')
];

// Add address validation
export const validateAddress = [
  body('label')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address label must be between 2 and 50 characters'),
    
  body('street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
    
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
    
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
    
  body('zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Zip code must be between 3 and 20 characters'),
    
  body('coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
    
  body('coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
    
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];

// Update address validation
export const validateUpdateAddress = [
  body('label')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address label must be between 2 and 50 characters'),
    
  body('street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
    
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
    
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
    
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Zip code must be between 3 and 20 characters'),
    
  body('coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
    
  body('coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
    
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];

// Update preferences validation
export const validateUpdatePreferences = [
  body('notifications')
    .optional()
    .isObject()
    .withMessage('Notifications must be an object'),
    
  body('privacy')
    .optional()
    .isObject()
    .withMessage('Privacy settings must be an object'),
    
  body('communication')
    .optional()
    .isObject()
    .withMessage('Communication preferences must be an object')
];

// Delete account validation
export const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
];

// Phone verification validation
export const validatePhoneVerification = [
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Verification code must be 6 digits')
];

// Two-factor authentication setup validation
export const validateTwoFactorSetup = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Two-factor token must be 6 digits')
];

// Two-factor authentication disable validation
export const validateTwoFactorDisable = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to disable two-factor authentication')
];

// User update validation
export const validateUpdateUser = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('phone')
    .optional()
    .custom((value) => {
      // If phone is provided, validate it
      if (value) {
        // Allow empty strings to pass (they'll be ignored in the controller)
        if (value === '') {
          return true;
        }
        // Validate phone number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Basic international format
        if (!phoneRegex.test(value)) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),
    
  body('role')
    .optional()
    .isIn(['customer', 'business_owner', 'delivery_person'])
    .withMessage('Invalid role specified'),
    
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender specified')
];

// Bulk operation validation
export const validateBulkOperation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be an array with at least one user ID'),
    
  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ID'),
    
  // For bulk update operations, validate updateData
  body('updateData')
    .optional()
    .isObject()
    .withMessage('updateData must be an object')
];