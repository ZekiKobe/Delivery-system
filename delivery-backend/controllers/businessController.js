import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { MenuItem, MenuCategory } from '../models/Menu.js';
import db from '../models/index.js';
import logger from '../services/logger.js';
const { sequelize } = db;

// Get all businesses
export const getAllBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Build base conditions
    const conditions = [
      { is_active: true },
      { is_verified: true }
    ];
    
    // Add search filter
    if (req.query.search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${req.query.search}%` } },
          { description: { [Op.like]: `%${req.query.search}%` } }
        ]
      });
    }
    
    // Add category filter (for JSON field)
    if (req.query.category) {
      conditions.push(sequelize.literal(`JSON_CONTAINS(category, '"${req.query.category}"')`));
    }
    
    // Add business type filter
    if (req.query.businessType) {
      conditions.push({ business_type: req.query.businessType });
    }
    
    // Combine all conditions with Op.and
    const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};
    
    // Handle sorting
    let orderBy = [['created_at', 'DESC']];
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'rating':
          orderBy = [[sequelize.literal("CAST(JSON_EXTRACT(rating, '$.average') AS DECIMAL(3,2))"), 'DESC']];
          break;
        case 'featured':
          orderBy = [['is_featured', 'DESC'], ['created_at', 'DESC']];
          break;
        case 'name':
          orderBy = [['name', 'ASC']];
          break;
        default:
          orderBy = [['created_at', 'DESC']];
      }
    }
    
    const businesses = await Business.findAll({
      where: whereClause,
      limit,
      offset,
      order: orderBy
    });
    const count = await Business.count({ where: whereClause });
    
    res.json({
      success: true,
      data: {
        businesses,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all businesses error:', error);
    logger.error('Get all businesses error', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get business by ID
export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await Business.findByPk(businessId);
    
    // Check if business exists and is active
    if (!business || !business.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      data: { business }
    });
  } catch (error) {
    console.error('Get business by ID error:', error);
    logger.error('Get business by ID error', {
      error: error.message,
      stack: error.stack,
      businessId: req.params.businessId
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get business products/menu items (public)
export const getBusinessProducts = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      category,
      page = 1,
      limit = 100
    } = req.query;
    
    // Check if business exists and is active
    const business = await Business.findByPk(businessId);
    if (!business || !business.is_active || !business.is_verified) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    // Build where conditions
    const whereConditions = {
      business_id: businessId,
      is_available: true
    };
    
    if (category) {
      whereConditions.category = category;
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get menu items
    const { count: total, rows: menuItems } = await MenuItem.findAndCountAll({
      where: whereConditions,
      order: [['category', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });
    
    // Get categories for this business
    const categories = await MenuCategory.findAll({
      where: { 
        business_id: businessId,
        is_active: true
      },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: {
        menuItems,
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get business products error:', error);
    logger.error('Get business products error', {
      error: error.message,
      stack: error.stack,
      businessId: req.params.businessId
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search businesses
export const searchBusinesses = async (req, res) => {
  try {
    const { query, category, businessType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const whereClause = {
      is_active: true,
      is_verified: true
    };
    
    // Add search conditions
    if (query || req.query.search) {
      const searchTerm = query || req.query.search;
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ];
    }
    
    if (category || req.query.category) {
      const categoryValue = category || req.query.category;
      // For JSON field in MySQL, use JSON_CONTAINS
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        sequelize.literal(`JSON_CONTAINS(category, '"${categoryValue}"')`)
      ];
    }
    
    if (businessType || req.query.businessType) {
      whereClause.business_type = businessType || req.query.businessType;
    }
    
    // Handle sorting
    let orderBy = [['created_at', 'DESC']];
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'rating':
          orderBy = [[sequelize.literal("CAST(JSON_EXTRACT(rating, '$.average') AS DECIMAL(3,2))"), 'DESC']];
          break;
        case 'featured':
          orderBy = [['is_featured', 'DESC'], ['created_at', 'DESC']];
          break;
        case 'name':
          orderBy = [['name', 'ASC']];
          break;
        default:
          orderBy = [['created_at', 'DESC']];
      }
    }
    
    const businesses = await Business.findAll({
      where: whereClause,
      limit,
      offset,
      order: orderBy
    });
    const count = await Business.count({ where: whereClause });
    
    res.json({
      success: true,
      data: {
        businesses,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get featured businesses
export const getFeaturedBusinesses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const businesses = await Business.findAll({
      where: {
        is_active: true,
        is_verified: true,
        is_featured: true
      },
      limit,
      order: [[sequelize.literal("CAST(JSON_EXTRACT(rating, '$.average') AS DECIMAL(3,2))"), 'DESC']]
    });
    
    res.json({
      success: true,
      data: { businesses }
    });
  } catch (error) {
    console.error('Get featured businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get businesses by owner
export const getBusinessesByOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const businesses = await Business.findAll({
      where: { owner_id: userId }
    });
    
    res.json({
      success: true,
      data: { businesses }
    });
  } catch (error) {
    console.error('Get businesses by owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update business rating
export const updateBusinessRating = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating } = req.body;
    
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    // Update rating
    const currentRating = business.rating || { average: 0, count: 0 };
    const totalRating = (currentRating.average * currentRating.count) + rating;
    const newCount = currentRating.count + 1;
    const newAverage = totalRating / newCount;
    
    business.rating = {
      average: newAverage,
      count: newCount
    };
    
    await business.save();
    
    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: { rating: business.rating }
    });
  } catch (error) {
    console.error('Update business rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
