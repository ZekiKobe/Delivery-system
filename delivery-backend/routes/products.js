import express from 'express';
import { MenuItem } from '../models/Menu.js';
import Business from '../models/Business.js';
import BusinessProfile from '../models/BusinessProfile.js';

const router = express.Router();

/**
 * GET /api/products/featured - Get featured products
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const featuredProducts = await MenuItem.find({ 
      isAvailable: true,
      isSignature: true 
    })
    .populate('restaurant', 'name rating images')
    .populate('business', 'name rating images')
    .sort({ orderCount: -1, 'rating.average': -1 })
    .limit(parseInt(limit));

    // If no signature items, get popular items
    if (featuredProducts.length === 0) {
      const popularProducts = await MenuItem.find({ 
        isAvailable: true,
        isPopular: true 
      })
      .populate('restaurant', 'name rating images')
      .populate('business', 'name rating images')
      .sort({ orderCount: -1 })
      .limit(parseInt(limit));

      return res.json({
        success: true,
        data: { products: popularProducts }
      });
    }

    res.json({
      success: true,
      data: { products: featuredProducts }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

/**
 * GET /api/products/trending - Get trending products
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get products ordered frequently in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingProducts = await MenuItem.find({ 
      isAvailable: true,
      updatedAt: { $gte: sevenDaysAgo }
    })
    .populate('restaurant', 'name rating images')
    .populate('business', 'name rating images')
    .sort({ orderCount: -1, 'rating.average': -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products: trendingProducts }
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
});

/**
 * GET /api/products/search - Search products
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      q = '', 
      category = '', 
      minPrice = 0, 
      maxPrice = Number.MAX_SAFE_INTEGER,
      dietary = '',
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {
      isAvailable: true,
      price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
    };

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Dietary filter
    if (dietary) {
      query.dietary = { $in: [dietary] };
    }

    const skip = (page - 1) * limit;
    const total = await MenuItem.countDocuments(query);

    const products = await MenuItem.find(query)
      .populate('restaurant', 'name rating images address')
      .populate('business', 'name rating images address')
      .sort({ 'rating.average': -1, orderCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

/**
 * GET /api/products/:productId - Get product by ID
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await MenuItem.findById(productId)
      .populate('restaurant', 'name rating images address contact deliveryInfo operatingHours')
      .populate('business', 'name rating images address contact deliveryInfo operatingHours');

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
});

export default router;