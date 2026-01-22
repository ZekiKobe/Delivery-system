import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const BusinessVerification = sequelize.define('business_verification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  application_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  overall_status: {
    type: DataTypes.ENUM(
      'draft',
      'submitted',
      'under_review',
      'additional_info_required',
      'approved',
      'rejected',
      'suspended'
    ),
    defaultValue: 'draft'
  },
  submitted_at: {
    type: DataTypes.DATE
  },
  review_started_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  assigned_reviewer: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  documents: {
    type: DataTypes.JSON
  },
  verification_steps: {
    type: DataTypes.JSON
  },
  business_info: {
    type: DataTypes.JSON
  },
  owner_verification: {
    type: DataTypes.JSON
  },
  bank_verification: {
    type: DataTypes.JSON
  },
  compliance_checks: {
    type: DataTypes.JSON
  },
  notes: {
    type: DataTypes.TEXT
  },
  internal_notes: {
    type: DataTypes.TEXT
  },
  review_history: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'business_verifications',
  timestamps: true,
  underscored: true,
  indexes: []
});

export default BusinessVerification;
