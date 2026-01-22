import { validationResult } from 'express-validator';
import { MenuItem, MenuCategory } from '../models/Menu.js';
import Business from '../models/Business.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

/**
 * Create a new product
 */
export const createProduct = async (req, res) => {
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
    
    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId, is_active: true } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or inactive'
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      ingredients = [],
      allergens = [],
      dietary = [],
      nutrition = {},
      modifierGroups = [],
      preparationTime = 30,
      tags = [],
      isSpicy = false,
      spiceLevel = 0
    } = req.body;

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of files) {
        try {
          const uploadResult = await uploadToCloudinary(file, 'products');
          imageUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    const product = await MenuItem.create({
      name,
      description,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category,
      images: imageUrls,
      ingredients,
      allergens,
      dietary,
      nutrition,
      modifier_groups: modifierGroups.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          price: parseFloat(option.price)
        }))
      })),
      business_id: business.id,
      preparation_time: parseInt(preparationTime),
      tags,
      is_spicy: Boolean(isSpicy),
      spice_level: parseInt(spiceLevel),
      is_available: true
    });

    // Add business information to the product object
    product.dataValues.business = business;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all products for a business
 */
export const getBusinessProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isAvailable, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const query = { business_id: business.id };

    // Apply filters
    const whereConditions = { business_id: business.id };
    
    if (category) {
      whereConditions.category = category;
    }

    if (isAvailable !== undefined) {
      whereConditions.is_available = isAvailable === 'true';
    }

    if (search) {
      whereConditions[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.like]: `%${search}%` } },
        { description: { [Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count: total, rows: products } = await MenuItem.findAndCountAll({
      where: whereConditions,
      include: [{ model: Business, attributes: ['name', 'business_type'] }],
      order,
      offset,
      limit: parseInt(limit)
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    // Get categories for this business
    const categories = await MenuCategory.findAll({ 
      where: { business_id: business.id, is_active: true },
      order: [['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        products,
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get business products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * Get single product by ID
 */
export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const product = await MenuItem.findOne({
      where: { id: productId, business_id: business.id },
      include: [{ model: Business, attributes: ['name', 'business_type'] }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const product = await MenuItem.findOne({
      where: { id: productId, business_id: business.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle image uploads if new images are provided
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const imageUrls = [];
      
      for (const file of files) {
        try {
          const uploadResult = await uploadToCloudinary(file, 'products');
          imageUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      if (imageUrls.length > 0) {
        updateData.images = [...(updateData.keepExistingImages === 'true' ? product.images : []), ...imageUrls];
      }
    }

    // Process numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.preparationTime) updateData.preparationTime = parseInt(updateData.preparationTime);
    if (updateData.spiceLevel) updateData.spiceLevel = parseInt(updateData.spiceLevel);

    // Process modifier groups
    if (updateData.modifierGroups) {
      updateData.modifierGroups = updateData.modifierGroups.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          price: parseFloat(option.price)
        }))
      }));
    }

    // Process update data for Sequelize
    const updateFields = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'keepExistingImages') {
        // Map field names to Sequelize convention
        const sequelizeKey = key.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
        updateFields[sequelizeKey] = updateData[key];
      }
    });

    await product.update(updateFields);
    
    // Add business information to the product object
    product.dataValues.business = business;

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const product = await MenuItem.findOne({
      where: { id: productId, business_id: business.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await MenuItem.destroy({ where: { id: productId } });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * Toggle product availability
 */
export const toggleProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const product = await MenuItem.findOne({
      where: { id: productId, business_id: business.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update({ is_available: !product.is_available });

    res.json({
      success: true,
      message: `Product ${!product.is_available ? 'enabled' : 'disabled'} successfully`,
      data: { product }
    });

  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product availability'
    });
  }
};

/**
 * Bulk operations for products
 */
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { operation, productIds, updateData } = req.body;
    const userId = req.user.id;

    if (!operation || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk operation parameters'
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

    const filter = {
      id: productIds,
      business_id: business.id
    };

    let result;
    switch (operation) {
      case 'enable':
        result = await MenuItem.update({ is_available: true }, { where: filter });
        break;
      case 'disable':
        result = await MenuItem.update({ is_available: false }, { where: filter });
        break;
      case 'delete':
        result = await MenuItem.destroy({ where: filter });
        break;
      case 'update':
        if (updateData) {
          result = await MenuItem.update(updateData, { where: filter });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Update data is required for bulk update operation'
          });
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation type'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} operation completed`,
      data: { 
        modifiedCount: result.modifiedCount || result.deletedCount || 0
      }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
};

/**
 * Create menu category
 */
export const createCategory = async (req, res) => {
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
    const { name, description, icon, sortOrder } = req.body;

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const category = await MenuCategory.create({
      name,
      description,
      business_id: business.id,
      icon,
      sort_order: sortOrder || 0,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

/**
 * Get all categories for business
 */
export const getBusinessCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const categories = await MenuCategory.findAll({ 
      where: { business_id: business.id },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get business categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const category = await MenuCategory.findOne({
      _id: categoryId,
      business: business._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.update(updateData);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const category = await MenuCategory.findOne({
      _id: categoryId,
      business: business._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await MenuItem.count({
      where: { business_id: business.id, category: category.name }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} products are using this category. Please reassign or delete the products first.`
      });
    }

    await MenuCategory.destroy({ where: { id: categoryId } });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

/**
 * Get product analytics
 */
export const getProductAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30' } = req.query; // days

    // Find business owned by the user
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const days = parseInt(timeframe);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Top selling products
    const topProducts = await MenuItem.findAll({ 
      where: { business_id: business.id, is_available: true },
      order: [['order_count', 'DESC']],
      limit: 10,
      attributes: ['name', 'order_count', 'rating', 'price', 'category']
    });

    // Category performance
    const categoryPerformance = await MenuItem.findAll({
      where: { business_id: business.id, is_available: true },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
        [sequelize.fn('AVG', sequelize.col('rating.average')), 'averageRating'],
        [sequelize.fn('SUM', sequelize.col('order_count')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.literal('order_count * price')), 'totalRevenue']
      ],
      group: ['category'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']]
    });

    // Products needing attention (low stock, poor ratings, etc.)
    const { Op } = require('sequelize');
    const lowRatedProducts = await MenuItem.findAll({
      where: {
        business_id: business.id,
        is_available: true,
        [Op.and]: [
          { 'rating.average': { [Op.lt]: 3 } },
          { 'rating.average': { [Op.gt]: 0 } }
        ]
      },
      attributes: ['name', 'rating', 'order_count'],
      limit: 5
    });

    const unpopularProducts = await MenuItem.findAll({
      where: {
        business_id: business.id,
        is_available: true,
        order_count: { [Op.lt]: 5 }
      },
      attributes: ['name', 'order_count', 'created_at'],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        topProducts,
        categoryPerformance,
        lowRatedProducts,
        unpopularProducts,
        summary: {
          totalProducts: await MenuItem.count({ where: { business_id: business.id } }),
          activeProducts: await MenuItem.count({ where: { business_id: business.id, is_available: true } }),
          totalCategories: await MenuCategory.count({ where: { business_id: business.id } })
        }
      }
    });

  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics'
    });
  }
};

/**
 * Import products from CSV/Excel
 */
export const importProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
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

    // This is a placeholder for CSV/Excel import functionality
    // You would need to implement CSV parsing here using libraries like csv-parser or xlsx
    
    res.json({
      success: true,
      message: 'Product import feature is under development',
      data: { 
        businessId: business.id,
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import products'
    });
  }
};

/**
 * Export products to CSV
 */
export const exportProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const products = await MenuItem.findAll({ 
      where: { business_id: business.id },
      attributes: ['name', 'description', 'price', 'category', 'is_available', 'order_count', 'rating', 'created_at']
    });

    // Convert to CSV format
    const csvHeader = 'Name,Description,Price,Category,Available,Orders,Rating,Created\n';
    const csvData = products.map(product => [
      `"${product.name}"`,
      `"${product.description}"`,
      product.price,
      product.category,
      product.is_available,
      product.order_count,
      product.rating.average,
      product.created_at.toISOString().split('T')[0]
    ].join(',')).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${business.name}-products-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export products'
    });
  }
};

/**
 * Get product insights and recommendations
 */
export const getProductInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get insights and recommendations
    const totalProducts = await MenuItem.count({ where: { business_id: business.id } });
    const activeProducts = await MenuItem.count({ where: { business_id: business.id, is_available: true } });
    
    // Most ordered product
    const mostOrdered = await MenuItem.findOne({ 
      where: { business_id: business.id },
      order: [['order_count', 'DESC']]
    });

    // Highest rated product
    const { Op } = require('sequelize');
    const highestRated = await MenuItem.findOne({ 
      where: { 
        business_id: business.id,
        [Op.and]: [
          { 'rating.count': { [Op.gt]: 0 } }
        ]
      },
      order: [[sequelize.literal('rating.average'), 'DESC']]
    });

    // Products without images
    const productsWithoutImages = await MenuItem.count({
      where: {
        business_id: business.id,
        [Op.and]: [
          { images: { [Op.eq]: [] } }
        ]
      }
    });

    // Products with low ratings
    const lowRatedCount = await MenuItem.count({
      where: {
        business_id: business.id,
        [Op.and]: [
          { 'rating.average': { [Op.lt]: 3 } },
          { 'rating.average': { [Op.gt]: 0 } }
        ]
      }
    });

    const insights = {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      mostOrderedProduct: mostOrdered?.name || 'N/A',
      highestRatedProduct: highestRated?.name || 'N/A',
      productsWithoutImages,
      lowRatedProductsCount: lowRatedCount,
      recommendations: []
    };

    // Generate recommendations
    if (productsWithoutImages > 0) {
      insights.recommendations.push({
        type: 'images',
        message: `${productsWithoutImages} products are missing images. Products with images get 3x more orders.`,
        action: 'Add product images'
      });
    }

    if (lowRatedCount > 0) {
      insights.recommendations.push({
        type: 'quality',
        message: `${lowRatedCount} products have low ratings. Consider improving or removing them.`,
        action: 'Review low-rated products'
      });
    }

    if (activeProducts < 5) {
      insights.recommendations.push({
        type: 'inventory',
        message: 'Consider adding more products to attract more customers.',
        action: 'Add more products'
      });
    }

    res.json({
      success: true,
      data: { insights }
    });

  } catch (error) {
    console.error('Get product insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product insights'
    });
  }
};
