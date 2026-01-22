import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, generateRandomPassword } from '../utils/password.js';
import { sendEmail } from '../services/emailService.js';
import { Op } from 'sequelize';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Register user
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role = 'customer',
      dateOfBirth,
      gender,
      deliveryPersonProfile,
      businessProfile
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user data object
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      phone,
      role,
      date_of_birth: dateOfBirth,
      gender
    };

    // Add role-specific profile data
    if (role === 'delivery_person' && deliveryPersonProfile) {
      userData.delivery_person_profile = {
        ...deliveryPersonProfile,
        vehicleType: deliveryPersonProfile.vehicleType || '',
        isAvailable: true,
        totalDeliveries: 0,
        rating: 0,
        totalRatings: 0
      };
    }

    if (role === 'business_owner' && businessProfile) {
      userData.business_profile = businessProfile;
    }

    // Generate referral code
    userData.referral_code = generateReferralCode();

    // Create new user
    const user = await User.create(userData);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.email_verification_token = emailVerificationToken;

    await user.save();

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Save refresh token
    user.refresh_token = refreshToken;
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Delivery System',
        template: 'emailVerification',
        data: {
          name: user.getFullName(),
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, twoFactorCode } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({
      where: { email: email }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid Password!'
      });
    }

    // Check two-factor authentication if enabled
    if (user.two_factor_enabled && twoFactorCode) {
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: twoFactorCode
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }
    } else if (user.two_factor_enabled && !twoFactorCode) {
      return res.status(401).json({
        success: false,
        message: 'Two-factor authentication code required'
      });
    }

    // Reset login attempts on successful login
    if (user.login_attempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login and activity
    user.last_login = new Date();
    user.last_activity = new Date();
    
    // Generate new tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    // Save new refresh token
    user.refresh_token = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          twoFactorEnabled: user.two_factor_enabled,
          addresses: user.addresses,
          preferences: user.preferences
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user with this refresh token
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        refresh_token: refreshToken
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    // Update refresh token in database
    user.refresh_token = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user) {
      user.refresh_token = null;
      user.last_activity = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.password_reset_token = resetToken;
    user.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset - Delivery System',
        template: 'passwordReset',
        data: {
          name: user.getFullName(),
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      user.password_reset_token = null;
      user.password_reset_expires = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      where: { email_verification_token: token } 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    // Update last activity
    const user = await User.findByPk(req.user.id);
    user.last_activity = new Date();
    await user.save();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          twoFactorEnabled: user.two_factor_enabled,
          addresses: user.addresses,
          preferences: user.preferences,
          dateOfBirth: user.date_of_birth,
          gender: user.gender
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Enable two-factor authentication
export const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `Delivery System (${user.email})`,
      issuer: 'Delivery System'
    });
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    res.json({
      success: true,
      message: 'Two-factor authentication setup initiated',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify and activate two-factor authentication
export const verifyTwoFactor = async (req, res) => {
  try {
    const { secret, token } = req.body;
    const user = await User.findByPk(req.user.id);
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Activate 2FA
    user.two_factor_enabled = true;
    user.two_factor_secret = secret;
    await user.save();
    
    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Disable two-factor authentication
export const disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Disable 2FA
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    await user.save();
    
    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Generate referral code
const generateReferralCode = () => {
  return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
};