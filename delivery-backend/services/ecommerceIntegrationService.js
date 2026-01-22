/**
 * Ecommerce Integration Service
 * Handles communication with external ecommerce system
 */

import axios from 'axios';
import logger from './logger.js';

const ECOMMERCE_API_URL = process.env.ECOMMERCE_API_URL || 'https://api.simunimart.com';
const ECOMMERCE_API_KEY = process.env.ECOMMERCE_API_KEY || '';

/**
 * Create axios instance for ecommerce API
 */
const ecommerceApi = axios.create({
  baseURL: ECOMMERCE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': ECOMMERCE_API_KEY ? `Bearer ${ECOMMERCE_API_KEY}` : undefined
  }
});

/**
 * Verify ecommerce order exists
 * @param {string} ecommerceOrderId - Order ID from ecommerce system
 * @returns {Promise<Object>} Order data from ecommerce
 */
export const verifyEcommerceOrder = async (ecommerceOrderId) => {
  try {
    const response = await ecommerceApi.get(`/orders/${ecommerceOrderId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Ecommerce order verification failed', {
      error: error.message,
      ecommerceOrderId,
      status: error.response?.status
    });
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};

/**
 * Get order details from ecommerce
 * @param {string} ecommerceOrderId - Order ID from ecommerce system
 * @returns {Promise<Object>} Order details
 */
export const getEcommerceOrderDetails = async (ecommerceOrderId) => {
  try {
    const response = await ecommerceApi.get(`/orders/${ecommerceOrderId}/details`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Failed to fetch ecommerce order details', {
      error: error.message,
      ecommerceOrderId
    });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Notify ecommerce about delivery status update
 * @param {string} ecommerceOrderId - Order ID from ecommerce system
 * @param {string} status - Delivery status
 * @param {Object} trackingData - Tracking information
 * @returns {Promise<Object>} Response
 */
export const notifyEcommerceDeliveryStatus = async (ecommerceOrderId, status, trackingData = {}) => {
  try {
    const response = await ecommerceApi.post(`/orders/${ecommerceOrderId}/delivery-status`, {
      status,
      tracking: trackingData,
      timestamp: new Date().toISOString()
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Failed to notify ecommerce about delivery status', {
      error: error.message,
      ecommerceOrderId,
      status
    });
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  verifyEcommerceOrder,
  getEcommerceOrderDetails,
  notifyEcommerceDeliveryStatus
};

