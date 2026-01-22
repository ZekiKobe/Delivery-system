import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Inventory = sequelize.define('inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menu_items',
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
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  maximum_stock: {
    type: DataTypes.INTEGER
  },
  reorder_point: {
    type: DataTypes.INTEGER
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  supplier: {
    type: DataTypes.JSON
  },
  track_inventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allow_backorders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiration_date: {
    type: DataTypes.DATE
  },
  batch_number: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.JSON
  },
  last_restocked: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_sold: {
    type: DataTypes.DATE
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock_history: {
    type: DataTypes.JSON
  },
  alerts: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'inventories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['sku'],
      unique: true
    },
    {
      fields: ['business_id', 'product_id'],
      unique: true
    },
    {
      fields: ['current_stock']
    },
    {
      fields: ['is_active']
    }
  ]
});

export default Inventory;
