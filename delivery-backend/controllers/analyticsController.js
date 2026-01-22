import User from '../models/User.js';
import Business from '../models/Business.js';
import Order from '../models/Order.js';
import { Op } from 'sequelize';

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userRegistrations = await User.findAll({
      attributes: [
        [User.sequelize.fn('DATE', User.sequelize.col('created_at')), 'date'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [User.sequelize.fn('DATE', User.sequelize.col('created_at'))],
      order: [[User.sequelize.fn('DATE', User.sequelize.col('created_at')), 'ASC']]
    });
    
    // Get user role distribution
    const roleDistribution = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    // Get user verification status
    const verificationStats = await User.findAll({
      attributes: [
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'total'],
        [User.sequelize.fn('SUM', User.sequelize.literal('CASE WHEN is_email_verified = true THEN 1 ELSE 0 END')), 'verified'],
        [User.sequelize.fn('SUM', User.sequelize.literal('CASE WHEN is_phone_verified = true THEN 1 ELSE 0 END')), 'phoneVerified']
      ]
    });
    
    res.json({
      success: true,
      data: {
        registrations: userRegistrations,
        roles: roleDistribution,
        verification: verificationStats[0]
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get business analytics
export const getBusinessAnalytics = async (req, res) => {
  try {
    // Get business registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const businessRegistrations = await Business.findAll({
      attributes: [
        [Business.sequelize.fn('DATE', Business.sequelize.col('created_at')), 'date'],
        [Business.sequelize.fn('COUNT', Business.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [Business.sequelize.fn('DATE', Business.sequelize.col('created_at'))],
      order: [[Business.sequelize.fn('DATE', Business.sequelize.col('created_at')), 'ASC']]
    });
    
    // Get business type distribution
    const typeDistribution = await Business.findAll({
      attributes: [
        'business_type',
        [Business.sequelize.fn('COUNT', Business.sequelize.col('id')), 'count']
      ],
      group: ['business_type']
    });
    
    // Get business verification status
    const verificationStats = await Business.findAll({
      attributes: [
        [Business.sequelize.fn('COUNT', Business.sequelize.col('id')), 'total'],
        [Business.sequelize.fn('SUM', User.sequelize.literal('CASE WHEN is_verified = true THEN 1 ELSE 0 END')), 'verified'],
        [Business.sequelize.fn('SUM', User.sequelize.literal('CASE WHEN is_active = true THEN 1 ELSE 0 END')), 'active']
      ]
    });
    
    res.json({
      success: true,
      data: {
        registrations: businessRegistrations,
        types: typeDistribution,
        verification: verificationStats[0]
      }
    });
  } catch (error) {
    console.error('Business analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get order analytics
export const getOrderAnalytics = async (req, res) => {
  try {
    // Get order trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orderTrends = await Order.findAll({
      attributes: [
        [Order.sequelize.fn('DATE', Order.sequelize.col('created_at')), 'date'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('pricing.total')), 'revenue']
      ],
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [Order.sequelize.fn('DATE', Order.sequelize.col('created_at'))],
      order: [[Order.sequelize.fn('DATE', Order.sequelize.col('created_at')), 'ASC']]
    });
    
    // Get order status distribution
    const statusDistribution = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    res.json({
      success: true,
      data: {
        trends: orderTrends,
        statuses: statusDistribution
      }
    });
  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};