import api from './api.js';

export const paymentService = {
  // Create payment intent for order
  createOrderPayment: async (orderId) => {
    return await api.post(`/payments/orders/${orderId}/pay`);
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    return await api.post('/payments/confirm', { paymentIntentId });
  },

  // Process refund
  processRefund: async (orderId, amount = null, reason = '') => {
    return await api.post(`/payments/orders/${orderId}/refund`, { amount, reason });
  },

  // Payment method management
  getPaymentMethods: async () => {
    return await api.get('/payments/methods');
  },

  createPaymentMethodSetup: async () => {
    return await api.post('/payments/methods/setup');
  },

  removePaymentMethod: async (paymentMethodId) => {
    return await api.delete(`/payments/methods/${paymentMethodId}`);
  },

  // Stripe integration helpers
  processCardPayment: async (stripe, elements, orderTotal, orderId) => {
    try {
      // Create payment intent
      const paymentResponse = await paymentService.createOrderPayment(orderId);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message);
      }

      const { clientSecret, paymentIntentId } = paymentResponse.data;

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}/success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm payment with backend
      const confirmResponse = await paymentService.confirmPayment(paymentIntentId);
      
      return {
        success: true,
        paymentIntent,
        order: confirmResponse.data?.order
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  },

  // Save payment method for future use
  savePaymentMethod: async (stripe, elements) => {
    try {
      // Create setup intent
      const setupResponse = await paymentService.createPaymentMethodSetup();
      
      if (!setupResponse.success) {
        throw new Error(setupResponse.message);
      }

      const { clientSecret } = setupResponse.data;

      // Confirm setup intent with Stripe
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/settings/payment-methods`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        setupIntent
      };

    } catch (error) {
      console.error('Save payment method error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save payment method'
      };
    }
  },

  // Format payment method for display
  formatPaymentMethod: (paymentMethod) => {
    if (!paymentMethod) return null;

    const { type, card } = paymentMethod;

    if (type === 'card' && card) {
      return {
        id: paymentMethod.id,
        type: 'card',
        displayName: `${card.brand.toUpperCase()} •••• ${card.last4}`,
        brand: card.brand,
        last4: card.last4,
        expiry: `${card.expMonth.toString().padStart(2, '0')}/${card.expYear.toString().slice(-2)}`
      };
    }

    return {
      id: paymentMethod.id,
      type,
      displayName: type.charAt(0).toUpperCase() + type.slice(1)
    };
  },

  // Calculate fees
  calculateFees: (subtotal) => {
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% service fee
    const tax = Math.round(subtotal * 0.15 * 100) / 100; // 15% tax
    const processingFee = Math.round(subtotal * 0.029 * 100) / 100; // 2.9% processing fee
    
    return {
      serviceFee,
      tax,
      processingFee,
      total: serviceFee + tax + processingFee
    };
  },

  // Validate payment data
  validatePaymentData: (paymentData) => {
    const errors = [];

    if (!paymentData.paymentMethodId && !paymentData.useNewCard) {
      errors.push('Payment method is required');
    }

    if (paymentData.useNewCard) {
      if (!paymentData.cardNumber) {
        errors.push('Card number is required');
      }

      if (!paymentData.expiryDate) {
        errors.push('Expiry date is required');
      }

      if (!paymentData.cvv) {
        errors.push('CVV is required');
      }

      if (!paymentData.billingAddress) {
        errors.push('Billing address is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Check if payment is successful
  isPaymentSuccessful: (paymentStatus) => {
    return paymentStatus === 'completed' || paymentStatus === 'succeeded';
  },

  // Check if payment is pending
  isPaymentPending: (paymentStatus) => {
    return paymentStatus === 'processing' || paymentStatus === 'pending';
  },

  // Check if payment failed
  isPaymentFailed: (paymentStatus) => {
    return paymentStatus === 'failed' || paymentStatus === 'cancelled';
  }
};