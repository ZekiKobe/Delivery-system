import { validationResult } from 'express-validator';
import Business from '../models/Business.js';
import { Op } from 'sequelize';
import db from '../models/index.js';
import logger from '../services/logger.js';
const { sequelize } = db;

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Build base conditions
    const conditions = [
      { business_type: 'restaurant' },
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
    
    // Add cuisine filter (tags field)
    if (req.query.cuisine) {
      conditions.push(sequelize.literal(`JSON_CONTAINS(tags, '"${req.query.cuisine}"')`));
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
    
    const { count, rows: restaurants } = await Business.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: orderBy
    });
    
    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all restaurants error:', error);
    logger.error('Get all restaurants error', {
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

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const restaurant = await Business.findByPk(restaurantId);
    
    // Check if restaurant exists, is active, and is a restaurant
    if (!restaurant || !restaurant.is_active || restaurant.business_type !== 'restaurant') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    logger.error('Get restaurant by ID error', {
      error: error.message,
      stack: error.stack,
      restaurantId: req.params.restaurantId
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search restaurants
export const searchRestaurants = async (req, res) => {
  try {
    const { query, category, cuisine } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build base conditions
    const conditions = [
      { business_type: 'restaurant' },
      { is_active: true },
      { is_verified: true }
    ];
    
    // Add search conditions
    if (query || req.query.search) {
      const searchTerm = query || req.query.search;
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } }
        ]
      });
    }
    
    if (category || req.query.category) {
      const categoryValue = category || req.query.category;
      conditions.push(sequelize.literal(`JSON_CONTAINS(category, '"${categoryValue}"')`));
    }
    
    if (cuisine || req.query.cuisine) {
      const cuisineValue = cuisine || req.query.cuisine;
      conditions.push(sequelize.literal(`JSON_CONTAINS(tags, '"${cuisineValue}"')`));
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
    
    const { count, rows: restaurants } = await Business.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: orderBy
    });
    
    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search restaurants error:', error);
    logger.error('Search restaurants error', {
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

// Get featured restaurants
export const getFeaturedRestaurants = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const restaurants = await Business.findAll({
      where: {
        business_type: 'restaurant',
        is_active: true,
        is_verified: true,
        is_featured: true
      },
      limit,
      order: [[sequelize.literal("CAST(JSON_EXTRACT(rating, '$.average') AS DECIMAL(3,2))"), 'DESC']]
    });
    
    res.json({
      success: true,
      data: { restaurants }
    });
  } catch (error) {
    console.error('Get featured restaurants error:', error);
    logger.error('Get featured restaurants error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
