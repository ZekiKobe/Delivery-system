/**
 * Ecommerce Integration Service
 * Handles integration with external ecommerce system
 */

const ECOMMERCE_BASE_URL = import.meta.env.VITE_ECOMMERCE_URL || 'https://api.simunimart.com';
const ECOMMERCE_FRONTEND_URL = import.meta.env.VITE_ECOMMERCE_FRONTEND_URL || 'https://simunimart.com';

export const ecommerceService = {
  /**
   * Get product URL for redirecting to ecommerce
   * @param {string|number} businessId - Business ID
   * @param {string|number|null} productId - Product ID (optional)
   * @returns {string} Ecommerce URL
   */
  getProductUrl: (businessId, productId = null) => {
    if (productId) {
      return `${ECOMMERCE_FRONTEND_URL}/products/${productId}?business=${businessId}`;
    }
    return `${ECOMMERCE_FRONTEND_URL}/business/${businessId}`;
  },

  /**
   * Get business URL on ecommerce
   * @param {string|number} businessId - Business ID
   * @returns {string} Ecommerce URL
   */
  getBusinessUrl: (businessId) => {
    return `${ECOMMERCE_FRONTEND_URL}/business/${businessId}`;
  },

  /**
   * Get API base URL
   * @returns {string} API base URL
   */
  getApiUrl: () => {
    return ECOMMERCE_BASE_URL;
  }
};

export default ecommerceService;

