import { verifyToken, getTokenFromRequest } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../services/logger.js';

// Admin audit log helper
const logAdminAction = async (adminId, action, details = {}) => {
  try {
    logger.info(`[ADMIN ACTION] User: ${adminId}, Action: ${action}`, { details });
    // Here you could save to an audit log collection
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      logger.warn('Authentication failed: No token provided', { ip: req.ip, path: req.path });
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      logger.warn('Authentication failed: User not found', { userId: decoded.userId, ip: req.ip });
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.is_active) {
      logger.warn('Authentication failed: User deactivated', { userId: user.id, email: user.email });
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    logger.debug('Authentication successful', { userId: user.id, role: user.role });
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message, stack: error.stack, ip: req.ip });
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten the roles array in case it's nested
    const flatRoles = roles.flat();
    
    if (!req.user) {
      logger.warn('Authorization failed: No user found', { path: req.path, ip: req.ip });
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: flatRoles,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    logger.debug('Authorization successful', { userId: req.user.id, role: req.user.role });
    next();
  };
};

export const adminOnly = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Business owner middleware that handles verification status
export const businessOwnerAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (req.user.role !== 'business_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Business owner privileges required.'
      });
    }

    // Check if business owner has a business profile
    if (!req.user.business_profile) {
      return res.status(403).json({
        success: false,
        message: 'Business profile not found. Please complete your business registration.',
        verificationStatus: 'no_business_profile'
      });
    }

    // Add verification status to request for frontend handling
    req.verificationStatus = req.user.business_profile.verificationStatus || 'pending';
    
    // Allow access even if verification is pending, but mark it
    req.isPendingVerification = req.verificationStatus === 'pending' || 
                               req.verificationStatus === 'under_review' || 
                               req.verificationStatus === 'pending_business_creation';

    // Check if business setup is complete (businessId exists)
    req.needsBusinessSetup = !req.user.business_profile.businessId;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check.',
      error: error.message
    });
  }
};

export const requirePermissions = (permissions = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Admin users have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check specific permissions for other roles
    const userPermissions = getUserPermissions(req.user.role);
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      await logAdminAction(req.user.id, 'PERMISSION_DENIED', {
        requiredPermissions: permissions,
        userRole: req.user.role,
        endpoint: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
        required: permissions
      });
    }

    next();
  };
};

// Helper function to get permissions by role
const getUserPermissions = (role) => {
  const permissions = {
    customer: ['order:create', 'order:view', 'profile:update'],
    business_owner: [
      'business:create', 'business:update', 'business:view',
      'menu:create', 'menu:update', 'menu:delete',
      'order:view', 'order:update_status'
    ],
    delivery_person: [
      'delivery:view', 'delivery:update_status', 'delivery:location_update',
      'profile:update'
    ],
    admin: ['*'] // All permissions
  };
  
  return permissions[role] || [];
};

export const optional = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};