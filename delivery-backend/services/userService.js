import User from '../models/User.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

class UserService {
  // Get user by ID
  async getUserById(id) {
    return await User.findByPk(id);
  }

  // Get user by email
  async getUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  // Get user by phone
  async getUserByPhone(phone) {
    return await User.findOne({ where: { phone } });
  }

  // Get users by role
  async getUsersByRole(role, limit = 10, offset = 0) {
    return await User.findAndCountAll({
      where: { role },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  // Update user
  async updateUser(userId, updateData) {
    return await User.update(updateData, {
      where: { id: userId },
      returning: true
    });
  }

  // Deactivate user
  async deactivateUser(userId) {
    return await User.update(
      { is_active: false },
      { where: { id: userId } }
    );
  }

  // Activate user
  async activateUser(userId) {
    return await User.update(
      { is_active: true },
      { where: { id: userId } }
    );
  }

  // Generate referral code
  generateReferralCode() {
    return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get referral statistics
  async getReferralStats(userId) {
    const user = await User.findByPk(userId);
    if (!user || !user.referral_code) {
      return { totalReferrals: 0, referralCode: null };
    }

    const referrals = await User.count({
      where: { referred_by: userId }
    });

    return {
      totalReferrals: referrals,
      referralCode: user.referral_code
    };
  }

  // Get users referred by a user
  async getReferredUsers(userId, limit = 10, offset = 0) {
    return await User.findAndCountAll({
      where: { referred_by: userId },
      attributes: ['id', 'first_name', 'last_name', 'email', 'created_at'],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    return await User.update(
      { preferences: updatedPreferences },
      { where: { id: userId } }
    );
  }

  // Update user addresses
  async updateUserAddresses(userId, addresses) {
    return await User.update(
      { addresses },
      { where: { id: userId } }
    );
  }

  // Get user activity summary
  async getUserActivitySummary(userId, days = 30) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // In a real implementation, you would query activity logs
    // For now, we'll return basic user activity data
    return {
      lastLogin: user.last_login,
      lastActivity: user.last_activity,
      accountCreated: user.created_at,
      isActive: user.is_active
    };
  }

  // Search users
  async searchUsers(query, role = null, limit = 10, offset = 0) {
    const whereClause = {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${query}%` } },
        { last_name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } }
      ]
    };

    if (role) {
      whereClause.role = role;
    }

    return await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  // Get user statistics
  async getUserStatistics() {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const verifiedUsers = await User.count({ where: { is_email_verified: true } });
    
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      group: ['role']
    });

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.get('count'));
        return acc;
      }, {})
    };
  }

  // Bulk update users
  async bulkUpdateUsers(userIds, updateData) {
    return await User.update(updateData, {
      where: { id: { [Op.in]: userIds } }
    });
  }

  // Bulk delete users (soft delete)
  async bulkDeleteUsers(userIds) {
    return await User.update(
      { is_active: false },
      { where: { id: { [Op.in]: userIds } }
    });
  }
}

export default new UserService();