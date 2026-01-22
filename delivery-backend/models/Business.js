import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Business = sequelize.define('business', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  business_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.JSON,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Address as JSON
  address: {
    type: DataTypes.JSON,
    allowNull: false
  },
  // Contact as JSON
  contact: {
    type: DataTypes.JSON,
    allowNull: false
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Images as JSON
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Operating hours as JSON
  operating_hours: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Delivery info as JSON
  delivery_info: {
    type: DataTypes.JSON,
    allowNull: false
  },
  // Rating as JSON
  rating: {
    type: DataTypes.JSON,
    allowNull: true
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Revenue as JSON
  revenue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'under_review', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  // Documents as JSON
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Bank details as JSON
  bank_details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Settings as JSON
  settings: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Subscription as JSON
  subscription: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Metrics as JSON
  metrics: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['owner_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_verified']
    },
    {
      fields: ['verification_status']
    },
    {
      fields: ['business_type']
    },
    {
      fields: ['is_featured']
    }
  ]
});

export default Business;