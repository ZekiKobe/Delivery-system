/**
 * Delivery Estimate Controller
 * Calculates delivery fees and estimated times
 */

import { validationResult } from 'express-validator';
import Business from '../models/Business.js';
import logger from '../services/logger.js';

/**
 * Calculate delivery estimate
 * GET /api/delivery/estimate
 */
export const calculateDeliveryEstimate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Support both query params and body
    const business_id = req.query.business_id || req.body.business_id;
    const delivery_address = req.query.delivery_address || req.body.delivery_address;

    if (!business_id || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'business_id and delivery_address are required'
      });
    }

    // Get business
    const business = await Business.findByPk(business_id);
    if (!business || !business.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or inactive'
      });
    }

    // Get delivery info
    const deliveryInfo = business.delivery_info || {};
    const deliveryFee = deliveryInfo.delivery_fee || deliveryInfo.deliveryFee || 0;
    const estimatedTime = deliveryInfo.estimated_delivery_time || { min: 30, max: 45 };
    const deliveryRadius = deliveryInfo.delivery_radius || deliveryInfo.deliveryRadius || 10;

    // Parse delivery address
    let addressData;
    try {
      addressData = typeof delivery_address === 'string' 
        ? JSON.parse(delivery_address) 
        : delivery_address;
    } catch (e) {
      addressData = { city: delivery_address };
    }

    // Check if address is within delivery radius (if coordinates provided)
    let isWithinRadius = true;
    if (addressData.coordinates && business.address?.coordinates) {
      // Simple distance calculation (Haversine formula would be better)
      const lat1 = business.address.coordinates.lat;
      const lng1 = business.address.coordinates.lng;
      const lat2 = addressData.coordinates.lat;
      const lng2 = addressData.coordinates.lng;
      
      // Rough distance calculation (simplified)
      const distance = Math.sqrt(
        Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
      ) * 111; // Convert to km (rough approximation)
      
      isWithinRadius = distance <= deliveryRadius;
    }

    res.json({
      success: true,
      data: {
        deliveryFee,
        estimatedTime,
        deliveryRadius,
        isWithinRadius,
        available: isWithinRadius && business.is_active && business.is_verified,
        business: {
          id: business.id,
          name: business.name
        }
      }
    });
  } catch (error) {
    logger.error('Calculate delivery estimate error', {
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

export default {
  calculateDeliveryEstimate
};

