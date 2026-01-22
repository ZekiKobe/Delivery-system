import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Review = sequelize.define('review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
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
  delivery_person_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ratings: {
    type: DataTypes.JSON,
    allowNull: false
  },
  comments: {
    type: DataTypes.JSON
  },
  item_reviews: {
    type: DataTypes.JSON
  },
  tags: {
    type: DataTypes.JSON
  },
  images: {
    type: DataTypes.JSON
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  helpful_votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  report_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  response: {
    type: DataTypes.JSON
  },
  moderation: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  indexes: []
});

export default Review;
