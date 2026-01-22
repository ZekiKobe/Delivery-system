import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Terms = sequelize.define('terms', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('general', 'customer', 'delivery_person', 'business_owner', 'privacy'),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  effective_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sections: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'terms',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type', 'is_active']
    },
    {
      fields: ['effective_date']
    }
  ]
});

export default Terms;