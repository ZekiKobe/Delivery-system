import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const MenuItem = sequelize.define('menu_item', {
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
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON
  },
  ingredients: {
    type: DataTypes.JSON
  },
  allergens: {
    type: DataTypes.JSON
  },
  dietary: {
    type: DataTypes.JSON
  },
  nutrition: {
    type: DataTypes.JSON
  },
  modifier_groups: {
    type: DataTypes.JSON
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_spicy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  spice_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON
  },
  rating: {
    type: DataTypes.JSON
  },
  order_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_signature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_available']
    },
    {
      fields: ['business_id', 'is_available']
    },
    {
      fields: ['business_id', 'category']
    }
  ]
});

// Menu Category model
const MenuCategory = sequelize.define('menu_category', {
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
    type: DataTypes.STRING(500)
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'menu_categories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['business_id', 'is_active']
    }
  ]
});

// Export both models
export { MenuItem, MenuCategory };