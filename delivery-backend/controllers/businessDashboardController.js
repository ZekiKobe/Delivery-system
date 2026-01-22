import Business from '../models/Business.js';
import { MenuItem, MenuCategory } from '../models/Menu.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import db from '../models/index.js';
const { sequelize } = db;
const { Op } = sequelize;
import { validationResult } from 'express-validator';

/**
 * Get business dashboard overview
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const verificationStatus = req.verificationStatus || 'pending';
    const isPendingVerification = req.isPendingVerification || false;
    const needsBusinessSetup = req.needsBusinessSetup || false;
    
    // If business setup is needed, return early with setup message
    if (needsBusinessSetup) {
      return res.status(200).json({
        success: true,
        data: {
          business: null,
          needsBusinessSetup: true,
          message: 'Please complete your business setup to access the dashboard',
          stats: {
            todayOrders: 0,
            todayRevenue: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0,
            totalCustomers: 0,
            rating: 0,
            totalOrders: 0
          },
          recentOrders: []
        }
      });
    }
    
    // Find business owned by the user
    let business;
    if (req.user.business_profile && req.user.business_profile.businessId) {
      business = await Business.findByPk(req.user.business_profile.businessId, {
        include: [{ model: User, as: 'owner', attributes: ['first_name', 'last_name', 'email'] }]
      });
    } else {
      business = await Business.findOne({
        where: { owner_id: userId },
        include: [{ model: User, as: 'owner', attributes: ['first_name', 'last_name', 'email'] }]
      });
    }
    
    // If verification is pending, return limited dashboard data
    if (isPendingVerification) {
      return res.status(200).json({
        success: true,
        data: {
          business: business || null,
          verificationStatus,
          isPendingVerification: true,
          message: `Your account is ${verificationStatus === 'pending' ? 'pending verification' : 'under review'}. You'll have full access once verified.`,
          stats: {
            todayOrders: 0,
            todayRevenue: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0,
            totalCustomers: 0,
            rating: 0,
            totalOrders: 0
          },
          recentOrders: [],
          needsBusinessSetup: false
        }
      });
    }
    
    if (!business) {
      // This should not happen if middleware is working correctly
      return res.status(404).json({
        success: false,
        message: 'Business not found. Please contact support.'
      });
    }

    // Get current date ranges
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get today's statistics
    const todayOrders = await Order.count({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startOfDay }
      }
    });

    const todayRevenueResult = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startOfDay },
        status: { [Op.in]: ['delivered', 'completed'] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('pricing.total')), 'total']]
    });
    const todayRevenue = todayRevenueResult[0]?.get('total') || 0;

    // Get weekly revenue
    const weeklyRevenueResult = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startOfWeek },
        status: { [Op.in]: ['delivered', 'completed'] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('pricing.total')), 'total']]
    });
    const weeklyRevenue = weeklyRevenueResult[0]?.get('total') || 0;

    // Get monthly revenue
    const monthlyRevenueResult = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startOfMonth },
        status: { [Op.in]: ['delivered', 'completed'] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('pricing.total')), 'total']]
    });
    const monthlyRevenue = monthlyRevenueResult[0]?.get('total') || 0;

    // Get total customer count (unique customers)
    const totalCustomers = await Order.count({
      where: { business_id: business.id },
      distinct: true,
      col: 'customer_id'
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
      where: { business_id: business.id },
      include: [{ model: User, as: 'customer', attributes: ['first_name', 'last_name', 'phone'] }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Calculate stats
    const stats = {
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalCustomers: totalCustomers.length,
      rating: business.rating.average,
      totalOrders: business.totalOrders
    };

    res.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          businessType: business.business_type,
          status: business.is_active ? 'active' : 'inactive',
          isVerified: business.is_verified,
          rating: business.rating
        },
        stats,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get business orders with filtering and pagination
 */
export const getBusinessOrders = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const verificationStatus = req.verificationStatus || 'pending';
    const isPendingVerification = req.isPendingVerification || false;
    
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // If verification is pending, return empty orders with message
    if (isPendingVerification) {
      return res.status(200).json({
        success: true,
        data: {
          orders: [],
          verificationStatus,
          isPendingVerification: true,
          message: `Your account is ${verificationStatus === 'pending' ? 'pending verification' : 'under review'}. You'll see orders once verified.`,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(200).json({
        success: true,
        data: {
          orders: [],
          needsBusinessSetup: true,
          message: 'Please complete your business setup first',
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build query
    const whereClause = { business_id: business.id };

    if (status && status.trim() !== '') {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
      if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
    }

    if (search && search.trim() !== '') {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { '$delivery_address.street$': { [Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const total = await Order.count({ where: whereClause });

    // Get orders
    const orders = await Order.findAll({
      where: whereClause,
      include: [{ model: User, as: 'customer', attributes: ['first_name', 'last_name', 'phone', 'email'] }],
      order: [['created_at', 'DESC']],
      offset: offset,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get business orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update orders while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find order
    const order = await Order.findOne({
      where: {
        id: orderId,
        business_id: business.id
      },
      include: [{ model: User, as: 'customer', attributes: ['first_name', 'last_name', 'phone', 'email'] }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    
    // Add tracking information
    const tracking = order.tracking || [];
    tracking.push({
      status,
      timestamp: new Date(),
      notes
    });
    order.tracking = tracking;

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get business menu items with filtering and pagination
 */
export const getMenuItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const verificationStatus = req.verificationStatus || 'pending';
    const isPendingVerification = req.isPendingVerification || false;
    
    const {
      page = 1,
      limit = 10,
      category,
      isAvailable,
      search
    } = req.query;

    // If verification is pending, return empty menu with message
    if (isPendingVerification) {
      return res.status(200).json({
        success: true,
        data: {
          menuItems: [],
          categories: [],
          verificationStatus,
          isPendingVerification: true,
          message: `Your account is ${verificationStatus === 'pending' ? 'pending verification' : 'under review'}. You'll see menu items once verified.`,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    
    if (!business) {
      return res.status(200).json({
        success: true,
        data: {
          menuItems: [],
          categories: [],
          needsBusinessSetup: true,
          message: 'Please complete your business setup first',
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build query
    const query = { restaurant: business._id };

    if (category && category.trim() !== '') {
      query.category = category;
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await MenuItem.countDocuments(query);

    // Get menu items
    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get categories for this business
    const categories = await MenuCategory.find({
      restaurant: business._id,
      isActive: true
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: {
        menuItems,
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new menu item
 */
export const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot create menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      ...req.body,
      business_id: business.id
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { menuItem }
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update menu item
 */
export const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { itemId } = req.params;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find and update menu item
    const menuItem = await MenuItem.findOne({
      where: { id: itemId, business_id: business.id }
    });
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await menuItem.update(req.body);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem }
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete menu item
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find and delete menu item
    const menuItem = await MenuItem.findOne({
      where: { id: itemId, business_id: business.id }
    });
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await menuItem.destroy();

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle menu item availability
 */
export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot toggle menu item availability while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find menu item
    const menuItem = await MenuItem.findOne({
      where: { id: itemId, business_id: business.id }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Toggle availability
    await menuItem.update({ is_available: !menuItem.is_available });

    res.json({
      success: true,
      message: `Menu item ${!menuItem.is_available ? 'enabled' : 'disabled'} successfully`,
      data: { menuItem }
    });

  } catch (error) {
    console.error('Toggle menu item availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get business analytics
 */
export const getBusinessAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, return empty analytics with message
    if (isPendingVerification) {
      return res.status(200).json({
        success: true,
        data: {
          period,
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0
          },
          revenueChart: [],
          orderStatusDistribution: [],
          popularItems: [],
          isPendingVerification: true,
          message: 'Analytics will be available once your account is verified'
        }
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Revenue analytics
    const revenueAnalytics = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startDate },
        status: { [Op.in]: ['delivered', 'completed'] }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('pricing.total')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Order status distribution
    const orderStatusAnalytics = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Popular menu items
    const popularItems = await Order.findAll({
      where: {
        business_id: business.id,
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'items.menuItem',
        [sequelize.fn('SUM', sequelize.col('items.quantity')), 'totalOrdered'],
        [sequelize.fn('SUM', sequelize.literal('items.price * items.quantity')), 'revenue']
      ],
      group: ['items.menuItem'],
      order: [[sequelize.fn('SUM', sequelize.col('items.quantity')), 'DESC']],
      limit: 10,
      include: [{ model: MenuItem, as: 'menuItem' }]
    });

    // Calculate totals
    const totalRevenue = revenueAnalytics.reduce((sum, day) => sum + day.get('revenue'), 0);
    const totalOrders = revenueAnalytics.reduce((sum, day) => sum + day.get('orders'), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        },
        revenueChart: revenueAnalytics,
        orderStatusDistribution: orderStatusAnalytics,
        popularItems
      }
    });

  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update business information
 */
export const updateBusinessInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update business information while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Update business information
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        business[key] = req.body[key];
      }
    });

    await business.save();

    res.json({
      success: true,
      message: 'Business information updated successfully',
      data: { business }
    });

  } catch (error) {
    console.error('Update business info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single menu item
 */
export const getMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot access menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find menu item
    const menuItem = await MenuItem.findOne({
      where: { id: itemId, business_id: business.id }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: { menuItem }
    });

  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Bulk update menu items
 */
export const bulkUpdateMenuItems = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const updatedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        if (!item.id) {
          errors.push({ id: 'unknown', error: 'Item ID is required' });
          continue;
        }

        const menuItem = await MenuItem.findOne({
          where: { id: item.id, business_id: business.id }
        });
        
        if (menuItem) {
          await menuItem.update(item.updates);
        }

        if (menuItem) {
          updatedItems.push(menuItem);
        } else {
          errors.push({ id: item.id, error: 'Menu item not found' });
        }
      } catch (error) {
        errors.push({ id: item.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Updated ${updatedItems.length} items successfully`,
      data: { 
        updatedItems,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk update menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Duplicate menu item
 */
export const duplicateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot duplicate menu items while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Find original menu item
    const originalItem = await MenuItem.findOne({
      where: { id: itemId, business_id: business.id }
    });

    if (!originalItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Create duplicate
    const duplicateData = {
      ...originalItem.get(),
      name: `${originalItem.name} (Copy)`
    };
    delete duplicateData.id;
    delete duplicateData.created_at;
    delete duplicateData.updated_at;
    duplicateData.is_available = false; // Start as unavailable

    const duplicateItem = await MenuItem.create(duplicateData);

    res.status(201).json({
      success: true,
      message: 'Menu item duplicated successfully',
      data: { menuItem: duplicateItem }
    });

  } catch (error) {
    console.error('Duplicate menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get menu categories for business
 */
export const getMenuCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const verificationStatus = req.verificationStatus || 'pending';
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, return empty categories with message
    if (isPendingVerification) {
      return res.status(200).json({
        success: true,
        data: {
          categories: [],
          verificationStatus,
          isPendingVerification: true,
          message: `Your account is ${verificationStatus === 'pending' ? 'pending verification' : 'under review'}. You'll see categories once verified.`
        }
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(200).json({
        success: true,
        data: {
          categories: [],
          needsBusinessSetup: true,
          message: 'Please complete your business setup first'
        }
      });
    }

    // Get categories from existing menu items
    const usedCategories = await MenuItem.findAll({
      where: { business_id: business.id },
      attributes: ['category'],
      group: ['category']
    });

    // Default categories based on business type
    const defaultCategories = {
      restaurant: [
        { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
        { id: 'main-course', name: 'Main Course', icon: '🍽️' },
        { id: 'desserts', name: 'Desserts', icon: '🍰' },
        { id: 'beverages', name: 'Beverages', icon: '🥤' },
        { id: 'sides', name: 'Sides', icon: '🍟' }
      ],
      grocery: [
        { id: 'fruits', name: 'Fruits', icon: '🍎' },
        { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
        { id: 'dairy', name: 'Dairy', icon: '🥛' },
        { id: 'meat', name: 'Meat', icon: '🥩' },
        { id: 'bakery', name: 'Bakery', icon: '🍞' },
        { id: 'pantry', name: 'Pantry', icon: '🥫' },
        { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
        { id: 'beverages', name: 'Beverages', icon: '🥤' }
      ],
      pharmacy: [
        { id: 'medicines', name: 'Medicines', icon: '💊' },
        { id: 'vitamins', name: 'Vitamins', icon: '🧴' },
        { id: 'personal-care', name: 'Personal Care', icon: '🧴' },
        { id: 'first-aid', name: 'First Aid', icon: '🩹' },
        { id: 'baby-care', name: 'Baby Care', icon: '👶' },
        { id: 'health-supplements', name: 'Health Supplements', icon: '💪' }
      ],
      electronics: [
        { id: 'phones', name: 'Phones', icon: '📱' },
        { id: 'laptops', name: 'Laptops', icon: '💻' },
        { id: 'accessories', name: 'Accessories', icon: '🎧' },
        { id: 'gaming', name: 'Gaming', icon: '🎮' },
        { id: 'home-electronics', name: 'Home Electronics', icon: '📺' }
      ],
      clothing: [
        { id: 'mens', name: "Men's Clothing", icon: '👔' },
        { id: 'womens', name: "Women's Clothing", icon: '👗' },
        { id: 'kids', name: "Kids' Clothing", icon: '👶' },
        { id: 'shoes', name: 'Shoes', icon: '👟' },
        { id: 'accessories', name: 'Accessories', icon: '👜' }
      ]
    };

    const businessTypeCategories = defaultCategories[business.businessType] || defaultCategories.restaurant;
    
    // Combine default categories with used categories
    const allCategories = [...businessTypeCategories];
    
    usedCategories.forEach(categoryObj => {
      const category = categoryObj.category;
      if (!allCategories.find(cat => cat.id === category || cat.name === category)) {
        allCategories.push({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          icon: '📦'
        });
      }
    });

    res.json({
      success: true,
      data: { categories: allCategories }
    });

  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle business status (open/closed)
 */
export const toggleBusinessStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const isPendingVerification = req.isPendingVerification || false;

    // If verification is pending, deny access
    if (isPendingVerification) {
      return res.status(403).json({
        success: false,
        message: 'Cannot toggle business status while account is pending verification'
      });
    }

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Toggle business status
    const settings = business.settings || {};
    settings.acceptsOrders = !settings.acceptsOrders;
    await business.update({ settings });

    res.json({
      success: true,
      message: `Business is now ${business.settings.acceptsOrders ? 'open' : 'closed'}`,
      data: {
        acceptsOrders: business.settings.acceptsOrders
      }
    });

  } catch (error) {
    console.error('Toggle business status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};