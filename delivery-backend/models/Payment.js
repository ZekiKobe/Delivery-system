import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Payment = sequelize.define('payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB'
  },
  method: {
    type: DataTypes.ENUM('card', 'cash', 'wallet', 'bank_transfer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  // Stripe-specific fields
  stripe_payment_intent_id: {
    type: DataTypes.STRING
  },
  stripe_charge_id: {
    type: DataTypes.STRING
  },
  stripe_refund_id: {
    type: DataTypes.STRING
  },
  // Card payment details (anonymized)
  card_details: {
    type: DataTypes.JSON
  },
  // Transaction details
  transaction_id: {
    type: DataTypes.STRING,
    unique: true
  },
  gateway_response: {
    type: DataTypes.JSON
  },
  // Fee breakdown
  fees: {
    type: DataTypes.JSON
  },
  // Refund information
  refund: {
    type: DataTypes.JSON
  },
  // Metadata
  metadata: {
    type: DataTypes.JSON
  },
  // Settlement information for businesses
  settlement: {
    type: DataTypes.JSON
  },
  // Failure details
  failure_reason: {
    type: DataTypes.STRING
  },
  failure_code: {
    type: DataTypes.STRING
  },
  // Audit trail
  events: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: []
});

export default Payment;