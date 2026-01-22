import express from 'express';
import { MenuItem } from '../models/Menu.js';
import Business from '../models/Business.js';

const router = express.Router();

/**
 * GET /api/categories - Get all categories
 */
router.get('/', async (req, res) => {
  try {
    // Get distinct categories from menu items
    const categories = await MenuItem.distinct('category');
    
    // Add some default categories with icons
    const defaultCategories = [
      { id: 'restaurant', name: 'Restaurants', icon: '🍽️', type: 'business' },
      { id: 'grocery', name: 'Grocery', icon: '🛒', type: 'business' },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', type: 'business' },
      { id: 'electronics', name: 'Electronics', icon: '📱', type: 'business' },
      { id: 'pizza', name: 'Pizza', icon: '🍕', type: 'food' },
      { id: 'burger', name: 'Burgers', icon: '🍔', type: 'food' },
      { id: 'salad', name: 'Salads', icon: '🥗', type: 'food' },
      { id: 'dessert', name: 'Desserts', icon: '🍰', type: 'food' },
      { id: 'beverage', name: 'Beverages', icon: '🥤', type: 'food' }
    ];

    // Combine with dynamic categories from database
    const dynamicCategories = categories.map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '_'),
      name: cat,
      icon: '🍴',
      type: 'food'
    }));

    const allCategories = [...defaultCategories, ...dynamicCategories.filter(
      dc => !defaultCategories.find(def => def.name.toLowerCase() === dc.name.toLowerCase())
    )];

    res.json({
      success: true,
      data: { categories: allCategories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/categories/root - Get root categories (business types)
 */
router.get('/root', async (req, res) => {
  try {
    const rootCategories = [
      { 
        id: 'restaurant', 
        name: 'Restaurants', 
        icon: '🍽️', 
        description: 'Food delivery from local restaurants',
        count: await Business.countDocuments({ businessType: 'restaurant', isActive: true })
      },
      { 
        id: 'grocery', 
        name: 'Grocery', 
        icon: '🛒', 
        description: 'Fresh groceries and essentials',
        count: await Business.countDocuments({ businessType: 'grocery', isActive: true })
      },
      { 
        id: 'pharmacy', 
        name: 'Pharmacy', 
        icon: '💊', 
        description: 'Medicines and health products',
        count: await Business.countDocuments({ businessType: 'pharmacy', isActive: true })
      },
      { 
        id: 'electronics', 
        name: 'Electronics', 
        icon: '📱', 
        description: 'Gadgets and electronic devices',
        count: await Business.countDocuments({ businessType: 'electronics', isActive: true })
      }
    ];

    res.json({
      success: true,
      data: { categories: rootCategories }
    });
  } catch (error) {
    console.error('Get root categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch root categories'
    });
  }
});

export default router;