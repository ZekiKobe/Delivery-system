import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Inventory from '../models/Inventory.js';
import { MenuItem } from '../models/Menu.js';
import Business from '../models/Business.js';
import Order from '../models/Order.js';
import sequelize from '../config/sequelize.js';
import logger from '../services/logger.js';

/**
 * Get inventory overview for business
 */
export const getInventoryOverview = async (req, res) => {
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

    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { business_id: business.id };
    
    // Filter by stock status
    if (status && status !== 'all') {
      switch (status) {
        case 'low_stock':
          where[Op.and] = [
            sequelize.literal('current_stock <= minimum_stock'),
            { current_stock: { [Op.gt]: 0 } }
          ];
          break;
        case 'out_of_stock':
          where.current_stock = 0;
          break;
        case 'in_stock':
          where[Op.and] = [
            sequelize.literal('current_stock > minimum_stock')
          ];
          break;
      }
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where,
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }],
      order: [['current_stock', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    // Get inventory statistics using Sequelize
    const stats = await Inventory.findAll({
      where: { business_id: business.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
        [sequelize.fn('SUM', sequelize.literal('current_stock * cost_price')), 'totalStockValue'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN current_stock <= minimum_stock AND current_stock > 0 THEN 1 ELSE 0 END`)), 'lowStockCount'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN current_stock = 0 THEN 1 ELSE 0 END')), 'outOfStockCount'],
        [sequelize.fn('AVG', sequelize.col('current_stock')), 'averageStockLevel']
      ],
      raw: true
    });

    // Get alerts
    const allInventory = await Inventory.findAll({
      where: { business_id: business.id, is_active: true },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name']
      }]
    });
    
    const alerts = [];
    allInventory.forEach(item => {
      if (item.current_stock <= item.minimum_stock && item.current_stock > 0) {
        alerts.push({
          type: 'low_stock',
          priority: 'high',
          message: `${item.product?.name || 'Product'} is running low on stock`,
          productId: item.product_id,
          currentStock: item.current_stock,
          minimumStock: item.minimum_stock
        });
      }
      if (item.current_stock === 0) {
        alerts.push({
          type: 'out_of_stock',
          priority: 'high',
          message: `${item.product?.name || 'Product'} is out of stock`,
          productId: item.product_id
        });
      }
      if (item.expiration_date && new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        alerts.push({
          type: 'expiring_soon',
          priority: 'medium',
          message: `${item.product?.name || 'Product'} is expiring soon`,
          productId: item.product_id,
          expirationDate: item.expiration_date
        });
      }
    });

    const statsData = stats[0] || {
      totalProducts: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      averageStockLevel: 0
    };

    res.json({
      success: true,
      data: {
        inventory,
        stats: {
          totalProducts: parseInt(statsData.totalProducts) || 0,
          totalStockValue: parseFloat(statsData.totalStockValue) || 0,
          lowStockCount: parseInt(statsData.lowStockCount) || 0,
          outOfStockCount: parseInt(statsData.outOfStockCount) || 0,
          averageStockLevel: parseFloat(statsData.averageStockLevel) || 0
        },
        alerts: alerts.slice(0, 10),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          hasNext: parseInt(page) < Math.ceil(count / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory overview'
    });
  }
};

/**
 * Get inventory for specific product
 */
export const getProductInventory = async (req, res) => {
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

    const inventory = await Inventory.findOne({
      where: {
        product_id: productId,
        business_id: business.id
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }]
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    res.json({
      success: true,
      data: { inventory }
    });

  } catch (error) {
    logger.error('Get product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product inventory'
    });
  }
};

/**
 * Create or update inventory for product
 */
export const updateProductInventory = async (req, res) => {
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
    const {
      current_stock,
      minimum_stock,
      maximum_stock,
      reorder_point,
      cost_price,
      supplier,
      track_inventory,
      allow_backorders,
      expiration_date,
      batch_number,
      location,
      alerts
    } = req.body;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Verify product belongs to business
    const product = await MenuItem.findOne({
      where: {
        id: productId,
        business_id: business.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let inventory = await Inventory.findOne({
      where: {
        product_id: productId,
        business_id: business.id
      }
    });

    if (inventory) {
      // Update existing inventory
      const previousStock = inventory.current_stock;
      
      // Update stock history if stock changed
      if (current_stock !== undefined && current_stock !== previousStock) {
        const stockHistory = inventory.stock_history || [];
        stockHistory.push({
          action: current_stock > previousStock ? 'restock' : 'adjustment',
          quantity: Math.abs(current_stock - previousStock),
          previousStock,
          newStock: current_stock,
          reason: 'Manual adjustment',
          performedBy: userId,
          cost: Math.abs(current_stock - previousStock) * (inventory.cost_price || 0),
          createdAt: new Date()
        });
        inventory.stock_history = stockHistory;
      }

      // Update fields
      if (current_stock !== undefined) inventory.current_stock = current_stock;
      if (minimum_stock !== undefined) inventory.minimum_stock = minimum_stock;
      if (maximum_stock !== undefined) inventory.maximum_stock = maximum_stock;
      if (reorder_point !== undefined) inventory.reorder_point = reorder_point;
      if (cost_price !== undefined) inventory.cost_price = cost_price;
      if (supplier !== undefined) inventory.supplier = supplier;
      if (track_inventory !== undefined) inventory.track_inventory = track_inventory;
      if (allow_backorders !== undefined) inventory.allow_backorders = allow_backorders;
      if (expiration_date !== undefined) inventory.expiration_date = expiration_date;
      if (batch_number !== undefined) inventory.batch_number = batch_number;
      if (location !== undefined) inventory.location = location;
      if (alerts !== undefined) inventory.alerts = { ...(inventory.alerts || {}), ...alerts };

      await inventory.save();
    } else {
      // Create new inventory record
      const stockHistory = current_stock > 0 ? [{
        action: 'initial',
        quantity: current_stock,
        previousStock: 0,
        newStock: current_stock,
        reason: 'Initial stock',
        performedBy: userId,
        cost: current_stock * (cost_price || 0),
        createdAt: new Date()
      }] : [];

      inventory = await Inventory.create({
        product_id: productId,
        business_id: business.id,
        current_stock: current_stock || 0,
        minimum_stock: minimum_stock || 5,
        maximum_stock,
        reorder_point,
        cost_price: cost_price || 0,
        supplier,
        track_inventory: track_inventory !== undefined ? track_inventory : true,
        allow_backorders: allow_backorders || false,
        expiration_date,
        batch_number,
        location,
        alerts,
        stock_history: stockHistory
      });
    }

    // Reload with product info
    await inventory.reload({
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }]
    });

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: { inventory }
    });

  } catch (error) {
    logger.error('Update product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory'
    });
  }
};

/**
 * Adjust stock levels
 */
export const adjustStock = async (req, res) => {
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
    const { adjustment, reason, cost_price } = req.body;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const inventory = await Inventory.findOne({
      where: {
        product_id: productId,
        business_id: business.id
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name']
      }]
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    // Update cost price if provided
    if (cost_price && adjustment > 0) {
      inventory.cost_price = cost_price;
    }

    // Adjust stock
    const previousStock = inventory.current_stock;
    const newStock = previousStock + adjustment;
    
    if (newStock < 0 && !inventory.allow_backorders) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock. Backorders not allowed.'
      });
    }

    inventory.current_stock = Math.max(0, newStock);
    
    // Update stock history
    const stockHistory = inventory.stock_history || [];
    stockHistory.push({
      action: adjustment > 0 ? 'restock' : 'sale',
      quantity: Math.abs(adjustment),
      previousStock,
      newStock: inventory.current_stock,
      reason: reason || 'Manual adjustment',
      performedBy: userId,
      cost: Math.abs(adjustment) * inventory.cost_price,
      createdAt: new Date()
    });
    inventory.stock_history = stockHistory;
    inventory.last_restocked = adjustment > 0 ? new Date() : inventory.last_restocked;
    if (adjustment < 0) inventory.last_sold = new Date();

    await inventory.save();

    res.json({
      success: true,
      message: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`,
      data: { inventory }
    });

  } catch (error) {
    logger.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to adjust stock'
    });
  }
};

/**
 * Bulk stock adjustment
 */
export const bulkAdjustStock = async (req, res) => {
  try {
    const { adjustments, reason } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustments array is required'
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

    const results = [];
    const errors = [];

    for (const adj of adjustments) {
      try {
        const inventory = await Inventory.findOne({
          where: {
            product_id: adj.productId,
            business_id: business.id
          }
        });

        if (!inventory) {
          errors.push({ productId: adj.productId, error: 'Inventory not found' });
          continue;
        }

        const previousStock = inventory.current_stock;
        const newStock = previousStock + adj.quantity;
        
        if (newStock < 0 && !inventory.allow_backorders) {
          errors.push({ productId: adj.productId, error: 'Insufficient stock' });
          continue;
        }

        inventory.current_stock = Math.max(0, newStock);
        
        const stockHistory = inventory.stock_history || [];
        stockHistory.push({
          action: adj.quantity > 0 ? 'restock' : 'sale',
          quantity: Math.abs(adj.quantity),
          previousStock,
          newStock: inventory.current_stock,
          reason: reason || 'Bulk adjustment',
          performedBy: userId,
          cost: Math.abs(adj.quantity) * inventory.cost_price,
          createdAt: new Date()
        });
        inventory.stock_history = stockHistory;

        await inventory.save();
        results.push({ productId: adj.productId, success: true });
      } catch (error) {
        errors.push({ productId: adj.productId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk stock adjustment completed',
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    logger.error('Bulk adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk stock adjustment'
    });
  }
};

/**
 * Get low stock alerts
 */
export const getLowStockAlerts = async (req, res) => {
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

    const lowStockItems = await Inventory.findAll({
      where: {
        business_id: business.id,
        track_inventory: true,
        [Op.and]: [
          sequelize.literal('current_stock <= minimum_stock'),
          { current_stock: { [Op.gt]: 0 } }
        ]
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }],
      order: [['current_stock', 'ASC']]
    });

    const outOfStockItems = await Inventory.findAll({
      where: {
        business_id: business.id,
        track_inventory: true,
        current_stock: 0
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }]
    });

    const expiringItems = await Inventory.findAll({
      where: {
        business_id: business.id,
        expiration_date: {
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category', 'images']
      }],
      order: [['expiration_date', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        lowStockItems,
        outOfStockItems,
        expiringItems,
        summary: {
          totalAlerts: lowStockItems.length + outOfStockItems.length + expiringItems.length,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          expiringCount: expiringItems.length
        }
      }
    });

  } catch (error) {
    logger.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts'
    });
  }
};

/**
 * Get inventory analytics
 */
export const getInventoryAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 30 } = req.query;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const days = parseInt(timeframe);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get all inventory with stock history
    const allInventory = await Inventory.findAll({
      where: { business_id: business.id },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category']
      }]
    });

    // Process stock movement from history
    const stockMovement = [];
    allInventory.forEach(inv => {
      if (inv.stock_history && Array.isArray(inv.stock_history)) {
        inv.stock_history.forEach(entry => {
          if (new Date(entry.createdAt) >= startDate) {
            stockMovement.push({
              date: new Date(entry.createdAt).toISOString().split('T')[0],
              action: entry.action,
              quantity: entry.quantity,
              cost: entry.cost || 0
            });
          }
        });
      }
    });

    // Group by date and action
    const groupedMovement = {};
    stockMovement.forEach(m => {
      const key = `${m.date}_${m.action}`;
      if (!groupedMovement[key]) {
        groupedMovement[key] = { date: m.date, action: m.action, quantity: 0, cost: 0 };
      }
      groupedMovement[key].quantity += m.quantity;
      groupedMovement[key].cost += m.cost;
    });

    res.json({
      success: true,
      data: {
        stockMovement: Object.values(groupedMovement),
        timeframe: days
      }
    });

  } catch (error) {
    logger.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory analytics'
    });
  }
};

/**
 * Generate stock report
 */
export const generateStockReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', include_history = false } = req.query;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const inventory = await Inventory.findAll({
      where: { business_id: business.id },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name', 'price', 'category']
      }],
      attributes: include_history === 'true' ? undefined : {
        exclude: ['stock_history']
      }
    });

    if (format === 'csv') {
      const headers = [
        'Product Name',
        'SKU',
        'Current Stock',
        'Minimum Stock',
        'Stock Status',
        'Stock Value',
        'Cost Price',
        'Last Restocked',
        'Supplier'
      ];

      const csvData = inventory.map(item => [
        item.product?.name || 'N/A',
        item.sku || 'N/A',
        item.current_stock,
        item.minimum_stock,
        item.current_stock === 0 ? 'Out of Stock' : 
        item.current_stock <= item.minimum_stock ? 'Low Stock' : 'In Stock',
        (item.current_stock * item.cost_price).toFixed(2),
        item.cost_price,
        item.last_restocked ? new Date(item.last_restocked).toISOString().split('T')[0] : 'N/A',
        item.supplier?.name || 'N/A'
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${business.name}-inventory-report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        inventory,
        summary: {
          totalProducts: inventory.length,
          totalStockValue: inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0),
          lowStockCount: inventory.filter(item => item.current_stock <= item.minimum_stock && item.current_stock > 0).length,
          outOfStockCount: inventory.filter(item => item.current_stock === 0).length
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Generate stock report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock report'
    });
  }
};

/**
 * Restock product
 */
export const restockProduct = async (req, res) => {
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
    const { quantity, cost_price, reason, supplier } = req.body;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const inventory = await Inventory.findOne({
      where: {
        product_id: productId,
        business_id: business.id
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name']
      }]
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    // Update supplier if provided
    if (supplier) {
      inventory.supplier = { ...(inventory.supplier || {}), ...supplier };
    }

    // Update cost price if provided
    if (cost_price) {
      inventory.cost_price = cost_price;
    }

    // Restock
    const previousStock = inventory.current_stock;
    inventory.current_stock = previousStock + quantity;
    inventory.last_restocked = new Date();

    // Update stock history
    const stockHistory = inventory.stock_history || [];
    stockHistory.push({
      action: 'restock',
      quantity,
      previousStock,
      newStock: inventory.current_stock,
      reason: reason || 'Product restocked',
      performedBy: userId,
      cost: quantity * inventory.cost_price,
      createdAt: new Date()
    });
    inventory.stock_history = stockHistory;

    await inventory.save();

    res.json({
      success: true,
      message: 'Product restocked successfully',
      data: { inventory }
    });

  } catch (error) {
    logger.error('Restock product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restock product'
    });
  }
};

/**
 * Get inventory alerts
 */
export const getInventoryAlerts = async (req, res) => {
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

    const inventory = await Inventory.findAll({
      where: {
        business_id: business.id,
        is_active: true
      },
      include: [{
        model: MenuItem,
        as: 'product',
        attributes: ['id', 'name']
      }]
    });

    const alerts = [];
    inventory.forEach(item => {
      if (item.current_stock <= item.minimum_stock && item.current_stock > 0) {
        alerts.push({
          type: 'low_stock',
          priority: 'high',
          productId: item.product_id,
          productName: item.product?.name,
          currentStock: item.current_stock,
          minimumStock: item.minimum_stock
        });
      }
      if (item.current_stock === 0) {
        alerts.push({
          type: 'out_of_stock',
          priority: 'high',
          productId: item.product_id,
          productName: item.product?.name
        });
      }
      if (item.expiration_date && new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        alerts.push({
          type: 'expiring_soon',
          priority: 'medium',
          productId: item.product_id,
          productName: item.product?.name,
          expirationDate: item.expiration_date
        });
      }
    });

    // Sort alerts by priority
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          totalAlerts: alerts.length,
          highPriority: alerts.filter(a => a.priority === 'high').length,
          mediumPriority: alerts.filter(a => a.priority === 'medium').length,
          lowPriority: alerts.filter(a => a.priority === 'low').length
        }
      }
    });

  } catch (error) {
    logger.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory alerts'
    });
  }
};

/**
 * Mark expired products
 */
export const markExpiredProducts = async (req, res) => {
  try {
    const { productIds, reason } = req.body;
    const userId = req.user.id;

    // Find business owned by the user
    const business = await Business.findOne({ where: { owner_id: userId } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const results = [];
    for (const productId of productIds) {
      try {
        const inventory = await Inventory.findOne({
          where: {
            product_id: productId,
            business_id: business.id
          }
        });

        if (inventory && inventory.current_stock > 0) {
          // Log expired stock
          const stockHistory = inventory.stock_history || [];
          stockHistory.push({
            action: 'expired',
            quantity: inventory.current_stock,
            previousStock: inventory.current_stock,
            newStock: 0,
            reason: reason || 'Product expired',
            performedBy: userId,
            cost: inventory.current_stock * inventory.cost_price,
            createdAt: new Date()
          });
          inventory.stock_history = stockHistory;
          inventory.current_stock = 0;
          await inventory.save();

          results.push({ productId, success: true });
        }
      } catch (error) {
        results.push({ productId, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Expired products processed',
      data: { results }
    });

  } catch (error) {
    logger.error('Mark expired products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark expired products'
    });
  }
};
