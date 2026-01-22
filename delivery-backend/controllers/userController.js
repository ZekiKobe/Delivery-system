import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { comparePassword } from '../utils/password.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { Op } from 'sequelize';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, deliveryPersonProfile } = req.body;
    const userId = req.user.id;

    // Check if phone number is already used by another user
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ 
        where: {
          phone: phone,
          id: {
            [Op.ne]: userId
          }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
    if (gender) updateData.gender = gender;
    
    // Handle delivery person profile updates
    if (deliveryPersonProfile && req.user.role === 'delivery_person') {
      // Get the existing user to preserve existing profile data
      const user = await User.findByPk(userId);
      
      // Merge the existing delivery person profile with new data
      updateData.delivery_person_profile = {
        ...user.delivery_person_profile,
        ...deliveryPersonProfile
      };
    }

    const user = await User.update(
      updateData,
      { 
        where: { id: userId },
        returning: true
      }
    );

    const updatedUser = await User.findByPk(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'avatars',
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face'
    });

    // Update user avatar
    await User.update(
      { avatar: result.secure_url },
      { where: { id: req.user.id } }
    );

    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { 
        user,
        avatarUrl: result.secure_url 
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { label, street, city, state, zipCode, coordinates, isDefault } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    // Get existing addresses or initialize empty array
    let addresses = user.addresses || [];

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      addresses = addresses.map(address => ({
        ...address,
        isDefault: false
      }));
    }

    // Add new address
    const newAddress = {
      id: Date.now().toString(), // Simple ID generation
      label,
      street,
      city,
      state,
      zipCode,
      coordinates,
      isDefault: isDefault || addresses.length === 0 // First address is default
    };

    addresses.push(newAddress);

    // Update user
    user.addresses = addresses;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { 
        addresses: user.addresses 
      }
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { addressId } = req.params;
    const { label, street, city, state, zipCode, coordinates, isDefault } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      const updatedAddresses = addresses.map((addr, index) => {
        if (index === addressIndex) {
          return {
            ...addr,
            label: label !== undefined ? label : addr.label,
            street: street !== undefined ? street : addr.street,
            city: city !== undefined ? city : addr.city,
            state: state !== undefined ? state : addr.state,
            zipCode: zipCode !== undefined ? zipCode : addr.zipCode,
            coordinates: coordinates !== undefined ? coordinates : addr.coordinates,
            isDefault: true
          };
        } else {
          return {
            ...addr,
            isDefault: false
          };
        }
      });
      
      user.addresses = updatedAddresses;
    } else {
      // Update specific address
      const address = addresses[addressIndex];
      if (label !== undefined) address.label = label;
      if (street !== undefined) address.street = street;
      if (city !== undefined) address.city = city;
      if (state !== undefined) address.state = state;
      if (zipCode !== undefined) address.zipCode = zipCode;
      if (coordinates !== undefined) address.coordinates = coordinates;
      if (isDefault !== undefined) address.isDefault = isDefault;
      
      addresses[addressIndex] = address;
      user.addresses = addresses;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { 
        addresses: user.addresses 
      }
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Check if this is the only address
    if (addresses.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only address. Please add another address first.'
      });
    }

    const wasDefault = addresses[addressIndex].isDefault;
    addresses.splice(addressIndex, 1);

    // If deleted address was default, make the first remaining address default
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    user.addresses = addresses;
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { 
        addresses: user.addresses 
      }
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update preferences
export const updatePreferences = async (req, res) => {
  try {
    const { categories, dietary, notifications } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (categories !== undefined) {
      updateData.preferences = {
        ...req.user.preferences,
        categories
      };
    }
    if (dietary !== undefined) {
      updateData.preferences = {
        ...req.user.preferences,
        dietary
      };
    }
    if (notifications !== undefined) {
      updateData.preferences = {
        ...req.user.preferences,
        notifications
      };
    }

    await User.update(
      updateData,
      { where: { id: userId } }
    );

    const user = await User.findByPk(userId);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { 
        preferences: user.preferences 
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Deactivate account instead of deleting
    user.is_active = false;
    user.refresh_token = null;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    
    res.json({
      success: true,
      data: {
        lastLogin: user.last_login,
        lastActivity: user.last_activity,
        accountCreated: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify phone number
export const verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    // In a real implementation, you would verify the code against a stored value
    // For now, we'll just mark the phone as verified
    const user = await User.findByPk(userId);
    user.is_phone_verified = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};