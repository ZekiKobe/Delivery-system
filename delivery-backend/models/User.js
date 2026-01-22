import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('customer', 'business_owner', 'delivery_person', 'admin'),
    defaultValue: 'customer'
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lock_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Enhanced user profile fields
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true
  },
  // Addresses stored as JSON array
  addresses: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // User preferences stored as JSON
  preferences: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Delivery person specific profile
  delivery_person_profile: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Business owner specific profile
  business_profile: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Two-factor authentication
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Account security
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_failed_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // User activity tracking
  last_activity: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Social authentication
  social_auth: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Profile completion status
  profile_incomplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Referral system
  referral_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referred_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['email'],
      unique: true,
      name: 'users_email_unique'
    },
    {
      fields: ['role'],
      name: 'users_role_idx'
    },
    {
      fields: ['is_active'],
      name: 'users_is_active_idx'
    }
  ]
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.isLocked = function() {
  return !!(this.lock_until && this.lock_until > Date.now());
};

User.prototype.incLoginAttempts = async function() {
  // Reset lock if lock expired
  if (this.lock_until && this.lock_until < Date.now()) {
    this.login_attempts = 1;
    this.lock_until = null;
  } else {
    // Increment attempts
    this.login_attempts++;
    
    // Lock account if attempts exceed threshold
    if (this.login_attempts >= 5) {
      this.lock_until = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
    }
  }
  
  return await this.save();
};

User.prototype.resetLoginAttempts = async function() {
  this.login_attempts = 0;
  this.lock_until = null;
  return await this.save();
};

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;