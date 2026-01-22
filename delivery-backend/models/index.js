import sequelize from '../config/sequelize.js';
import User from './User.js';
import Business from './Business.js';
import BusinessVerification from './BusinessVerification.js';
import Inventory from './Inventory.js';
import { MenuItem, MenuCategory } from './Menu.js';
import Order from './Order.js';
import Payment from './Payment.js';
import BusinessProfile from './BusinessProfile.js';
import Review from './Review.js';
import Terms from './Terms.js';

// Associate models
// User associations
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
User.hasMany(Business, { foreignKey: 'owner_id', as: 'businesses' });
User.hasOne(Payment, { foreignKey: 'customer_id', as: 'userPayment' });

// Business associations
Business.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Business.hasMany(Inventory, { foreignKey: 'business_id', as: 'inventories' });
Business.hasMany(MenuItem, { foreignKey: 'business_id', as: 'menuItems' });
Business.hasMany(MenuCategory, { foreignKey: 'business_id', as: 'menuCategories' });
Business.hasMany(Order, { foreignKey: 'business_id', as: 'orders' });
Business.hasOne(BusinessVerification, { foreignKey: 'business_id', as: 'verification' });

// BusinessVerification associations
BusinessVerification.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
BusinessVerification.belongsTo(User, { foreignKey: 'assigned_reviewer', as: 'assignedReviewer' });

// Inventory associations
Inventory.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Inventory.belongsTo(MenuItem, { foreignKey: 'product_id', as: 'product' });

// MenuItem associations
MenuItem.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
MenuItem.hasOne(Inventory, { foreignKey: 'product_id', as: 'inventory' });

// MenuCategory associations
MenuCategory.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// Order associations
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Order.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Order.belongsTo(User, { foreignKey: 'delivery_person_id', as: 'deliveryPerson' });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'orderPayment' });
Order.hasOne(Review, { foreignKey: 'order_id', as: 'review' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Payment.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// BusinessProfile associations
BusinessProfile.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Review associations
Review.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Review.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Review.belongsTo(User, { foreignKey: 'delivery_person_id', as: 'deliveryPerson' });

// Terms associations
Terms.belongsTo(User, { foreignKey: 'updated_by', as: 'updatedBy' });

const db = {
  sequelize,
  User,
  Business,
  BusinessVerification,
  Inventory,
  MenuItem,
  MenuCategory,
  Order,
  Payment,
  BusinessProfile,
  Review,
  Terms
};

export default db;