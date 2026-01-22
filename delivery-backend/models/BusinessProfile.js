import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const BusinessProfile = sequelize.define('business_profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
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
  address: {
    type: DataTypes.JSON,
    allowNull: false
  },
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
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  operating_hours: {
    type: DataTypes.JSON
  },
  delivery_info: {
    type: DataTypes.JSON,
    allowNull: false
  },
  rating: {
    type: DataTypes.JSON
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  bank_details: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'business_profiles',
  timestamps: true,
  underscored: true,
  indexes: []
});

export default BusinessProfile;