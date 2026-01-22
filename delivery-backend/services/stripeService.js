import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
export const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw error;
  }
};

// Confirm payment intent
export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Confirm payment intent error:', error);
    throw error;
  }
};

// Retrieve payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Retrieve payment intent error:', error);
    throw error;
  }
};

// Create refund
export const createRefund = async ({ paymentIntentId, amount, reason = 'requested_by_customer' }) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if specified
      reason,
    });

    return refund;
  } catch (error) {
    console.error('Create refund error:', error);
    throw error;
  }
};

// Create customer
export const createStripeCustomer = async ({ email, name, phone, metadata = {} }) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error('Create Stripe customer error:', error);
    throw error;
  }
};

// Retrieve customer
export const retrieveStripeCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Retrieve Stripe customer error:', error);
    throw error;
  }
};

// Create setup intent for saving payment methods
export const createSetupIntent = async (customerId) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return setupIntent;
  } catch (error) {
    console.error('Create setup intent error:', error);
    throw error;
  }
};

// List customer payment methods
export const listPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods;
  } catch (error) {
    console.error('List payment methods error:', error);
    throw error;
  }
};

// Detach payment method
export const detachPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Detach payment method error:', error);
    throw error;
  }
};

// Construct webhook event
export const constructWebhookEvent = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Create transfer to restaurant (for marketplace model)
export const createTransfer = async ({ amount, destination, metadata = {} }) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination,
      metadata,
    });

    return transfer;
  } catch (error) {
    console.error('Create transfer error:', error);
    throw error;
  }
};

// Create connected account for restaurant
export const createConnectedAccount = async ({ email, country = 'US', type = 'express' }) => {
  try {
    const account = await stripe.accounts.create({
      type,
      country,
      email,
    });

    return account;
  } catch (error) {
    console.error('Create connected account error:', error);
    throw error;
  }
};

// Create account link for onboarding
export const createAccountLink = async ({ accountId, refreshUrl, returnUrl }) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Create account link error:', error);
    throw error;
  }
};

// Retrieve account
export const retrieveAccount = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Retrieve account error:', error);
    throw error;
  }
};

// Calculate application fee (platform commission)
export const calculateApplicationFee = (amount, feePercentage = 0.1) => {
  return Math.round(amount * feePercentage * 100); // Convert to cents
};