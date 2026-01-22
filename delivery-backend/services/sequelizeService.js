import db from '../models/index.js';

const { User, Order, Business } = db;

// User service functions
export const createUserSequelize = async (userData) => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

export const findUserByIdSequelize = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};

export const findUserByEmailSequelize = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

export const updateUserSequelize = async (id, updateData) => {
  try {
    const [updatedRowsCount, updatedUsers] = await User.update(updateData, {
      where: { id },
      returning: true
    });
    return updatedUsers[0];
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Order service functions
export const createOrderSequelize = async (orderData) => {
  try {
    const order = await Order.create(orderData);
    return order;
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

export const findOrderByIdSequelize = async (id) => {
  try {
    const order = await Order.findByPk(id);
    return order;
  } catch (error) {
    throw new Error(`Error finding order: ${error.message}`);
  }
};

export const findOrdersByUserIdSequelize = async (userId) => {
  try {
    const orders = await Order.findAll({ where: { customer_id: userId } });
    return orders;
  } catch (error) {
    throw new Error(`Error finding orders by user ID: ${error.message}`);
  }
};

// Business service functions
export const createBusinessSequelize = async (businessData) => {
  try {
    const business = await Business.create(businessData);
    return business;
  } catch (error) {
    throw new Error(`Error creating business: ${error.message}`);
  }
};

export const findBusinessByIdSequelize = async (id) => {
  try {
    const business = await Business.findByPk(id);
    return business;
  } catch (error) {
    throw new Error(`Error finding business: ${error.message}`);
  }
};

export const findBusinessesByOwnerIdSequelize = async (ownerId) => {
  try {
    const businesses = await Business.findAll({ where: { owner_id: ownerId } });
    return businesses;
  } catch (error) {
    throw new Error(`Error finding businesses by owner ID: ${error.message}`);
  }
};

export default {
  createUserSequelize,
  findUserByIdSequelize,
  findUserByEmailSequelize,
  updateUserSequelize,
  createOrderSequelize,
  findOrderByIdSequelize,
  findOrdersByUserIdSequelize,
  createBusinessSequelize,
  findBusinessByIdSequelize,
  findBusinessesByOwnerIdSequelize
};