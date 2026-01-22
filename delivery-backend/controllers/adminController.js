import { validationResult } from 'express-validator';
import User from '../models/User.js';
import userService from '../services/userService.js';
import { Op } from 'sequelize';

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let result;
    if (search) {
      result = await userService.searchUsers(search, role, parseInt(limit), offset);
    } else if (role) {
      result = await userService.getUsersByRole(role, parseInt(limit), offset);
    } else {
      result = await User.findAndCountAll({
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.refresh_token;
    delete updateData.email_verification_token;
    delete updateData.password_reset_token;
    delete updateData.password_reset_expires;

    const [updatedRowsCount] = await userService.updateUser(id, updateData);

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await userService.getUserById(id);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await userService.deactivateUser(id);

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await userService.activateUser(id);

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await userService.deactivateUser(id);

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user statistics
export const getUserStatistics = async (req, res) => {
  try {
    const stats = await userService.getUserStatistics();
    
    res.json({
      success: true,
      data: { statistics: stats }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Bulk update users
export const bulkUpdateUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userIds, updateData } = req.body;

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.refresh_token;
    delete updateData.email_verification_token;
    delete updateData.password_reset_token;
    delete updateData.password_reset_expires;

    const updatedRowsCount = await userService.bulkUpdateUsers(userIds, updateData);

    res.json({
      success: true,
      message: `Successfully updated ${updatedRowsCount} users`,
      data: { updatedCount: updatedRowsCount }
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Bulk delete users (soft delete)
export const bulkDeleteUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userIds } = req.body;
    const updatedRowsCount = await userService.bulkDeleteUsers(userIds);

    res.json({
      success: true,
      message: `Successfully deleted ${updatedRowsCount} users`,
      data: { deletedCount: updatedRowsCount }
    });
  } catch (error) {
    console.error('Bulk delete users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get referral statistics for a user
export const getReferralStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await userService.getReferralStats(userId);
    
    res.json({
      success: true,
      data: { referralStats: stats }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get users referred by a user
export const getReferredUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await userService.getReferredUsers(userId, parseInt(limit), offset);
    
    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    console.error('Get referred users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};