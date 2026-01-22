import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true // Allow null for existing orders, will be generated on create
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',        // Order placed, waiting for restaurant confirmation
      'confirmed',      // Restaurant confirmed the order
      'preparing',      // Restaurant is preparing the order
      'ready',          // Order is ready for pickup
      'assigned',       // Delivery person assigned
      'picked_up',      // Order picked up by delivery person
      'on_the_way',     // Order is on the way to customer
      'delivered',      // Order delivered successfully
      'cancelled',      // Order cancelled
      'refunded'        // Order refunded
    ),
    defaultValue: 'pending'
  },
  delivery_address: {
    type: DataTypes.JSON,
    allowNull: false
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: false
  },
  payment: {
    type: DataTypes.JSON,
    allowNull: false
  },
  delivery_person_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  estimated_delivery_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_delivery_time: {
    type: DataTypes.DATE
  },
  preparation_time: {
    type: DataTypes.JSON
  },
  tracking: {
    type: DataTypes.JSON
  },
  customer_notes: {
    type: DataTypes.STRING(500)
  },
  restaurant_notes: {
    type: DataTypes.STRING(500)
  },
  preferred_vehicle_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  rating: {
    type: DataTypes.JSON
  },
  cancellation: {
    type: DataTypes.JSON
  },
  is_scheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduled_for: {
    type: DataTypes.DATE
  },
  // Ecommerce integration fields
  ecommerce_order_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to order ID in ecommerce system'
  },
  ecommerce_order_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to order number in ecommerce system'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['order_number'],
      unique: true,
      name: 'orders_order_number_unique'
    },
    {
      fields: ['customer_id'],
      name: 'orders_customer_id_idx'
    },
    {
      fields: ['business_id'],
      name: 'orders_business_id_idx'
    },
    {
      fields: ['status'],
      name: 'orders_status_idx'
    },
    {
      fields: ['status', 'business_id'],
      name: 'orders_status_business_idx'
    },
    {
      fields: ['ecommerce_order_id'],
      name: 'orders_ecommerce_order_id_idx'
    }
  ]
});

export default Order;
