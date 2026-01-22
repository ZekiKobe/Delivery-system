import { uploadUtils } from '../services/uploadService.js';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// Upload user avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'avatars',
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face'
    });

    // Update user avatar
    const user = await User.findByPk(req.user.id);
    user.avatar = result.secure_url;
    await user.save();

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

// Upload business image
export const uploadBusinessImage = async (req, res) => {
  try {
    const { businessId, imageType } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if business belongs to user
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `businesses/${businessId}`,
      width: imageType === 'logo' ? 200 : 800,
      height: imageType === 'logo' ? 200 : 600,
      crop: 'fill'
    });

    // Update business image
    if (imageType === 'logo') {
      business.images = business.images || {};
      business.images.logo = result.secure_url;
    } else if (imageType === 'cover') {
      business.images = business.images || {};
      business.images.cover = result.secure_url;
    } else {
      business.images = business.images || {};
      business.images.gallery = business.images.gallery || [];
      business.images.gallery.push(result.secure_url);
    }
    
    await business.save();

    res.json({
      success: true,
      message: 'Business image uploaded successfully',
      data: { 
        business,
        imageUrl: result.secure_url 
      }
    });
  } catch (error) {
    console.error('Upload business image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload business image'
    });
  }
};

// Delete business image
export const deleteBusinessImage = async (req, res) => {
  try {
    const { businessId, imageType, imageIndex } = req.params;
    
    // Check if business belongs to user
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update business image
    if (imageType === 'logo') {
      business.images = business.images || {};
      business.images.logo = '';
    } else if (imageType === 'cover') {
      business.images = business.images || {};
      business.images.cover = '';
    } else if (imageType === 'gallery') {
      business.images = business.images || {};
      business.images.gallery = business.images.gallery || [];
      business.images.gallery.splice(imageIndex, 1);
    }
    
    await business.save();

    res.json({
      success: true,
      message: 'Business image deleted successfully',
      data: { business }
    });
  } catch (error) {
    console.error('Delete business image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business image'
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const publicId = uploadUtils.extractPublicId(user.profileImage);
      if (publicId) {
        await uploadUtils.deleteFile(publicId);
      }
    }

    // Update user profile image
    user.profileImage = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        thumbnailUrl: uploadUtils.generateThumbnail(req.file.filename)
      }
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
};

// Upload delivery person license documents
export const uploadLicenseDocuments = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'delivery_person') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only delivery persons can upload license documents.'
      });
    }

    const uploadedFiles = {};

    // Process license document
    if (req.files.licenseDocument) {
      uploadedFiles.licenseDocument = req.files.licenseDocument[0].path;
    }

    // Process insurance document
    if (req.files.insuranceDocument) {
      uploadedFiles.insuranceDocument = req.files.insuranceDocument[0].path;
    }

    // Update user's delivery person profile
    if (!user.deliveryPersonProfile) {
      user.deliveryPersonProfile = {};
    }

    if (uploadedFiles.licenseDocument) {
      user.deliveryPersonProfile.licenseDocumentUrl = uploadedFiles.licenseDocument;
    }

    if (uploadedFiles.insuranceDocument) {
      user.deliveryPersonProfile.insuranceDocumentUrl = uploadedFiles.insuranceDocument;
    }

    // Update verification status
    user.deliveryPersonProfile.documentVerificationStatus = 'under_review';
    
    await user.save();

    res.json({
      success: true,
      message: 'License documents uploaded successfully',
      data: {
        uploadedFiles,
        verificationStatus: 'under_review'
      }
    });

  } catch (error) {
    console.error('Upload license documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload license documents'
    });
  }
};

// Upload business documents
export const uploadBusinessDocuments = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'business_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only business owners can upload business documents.'
      });
    }

    const uploadedFiles = {};

    // Process business license
    if (req.files.businessLicense) {
      uploadedFiles.businessLicense = req.files.businessLicense[0].path;
    }

    // Process tax document
    if (req.files.taxDocument) {
      uploadedFiles.taxDocument = req.files.taxDocument[0].path;
    }

    // Update user's business profile or create business record
    let business;
    if (user.businessProfile && user.businessProfile.businessId) {
      business = await Business.findById(user.businessProfile.businessId);
    }

    if (business) {
      // Update existing business documents
      if (uploadedFiles.businessLicense) {
        business.documents.businessLicense = uploadedFiles.businessLicense;
      }
      if (uploadedFiles.taxDocument) {
        business.documents.taxId = uploadedFiles.taxDocument;
      }
      
      business.verificationStatus = 'under_review';
      await business.save();
    } else {
      // Store in user profile temporarily until business is created
      if (!user.businessProfile) {
        user.businessProfile = {};
      }
      
      user.businessProfile.pendingDocuments = {
        businessLicense: uploadedFiles.businessLicense,
        taxDocument: uploadedFiles.taxDocument
      };
      user.businessProfile.verificationStatus = 'pending_business_creation';
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Business documents uploaded successfully',
      data: {
        uploadedFiles,
        verificationStatus: business ? 'under_review' : 'pending_business_creation'
      }
    });

  } catch (error) {
    console.error('Upload business documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload business documents',
      error: error.message
    });
  }
};

// Upload business images (logo, cover, gallery)
export const uploadBusinessImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { businessId } = req.params;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user owns this business
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const uploadedImages = {};

    // Process business logo
    if (req.files.businessLogo) {
      // Delete old logo if exists
      if (business.images.logo) {
        const publicId = uploadUtils.extractPublicId(business.images.logo);
        if (publicId) {
          await uploadUtils.deleteFile(publicId);
        }
      }
      
      uploadedImages.logo = req.files.businessLogo[0].path;
      business.images.logo = uploadedImages.logo;
    }

    // Process business cover
    if (req.files.businessCover) {
      // Delete old cover if exists
      if (business.images.cover) {
        const publicId = uploadUtils.extractPublicId(business.images.cover);
        if (publicId) {
          await uploadUtils.deleteFile(publicId);
        }
      }
      
      uploadedImages.cover = req.files.businessCover[0].path;
      business.images.cover = uploadedImages.cover;
    }

    // Process gallery images
    if (req.files.businessGallery) {
      const galleryImages = req.files.businessGallery.map(file => file.path);
      
      // Add to existing gallery or create new
      if (!business.images.gallery) {
        business.images.gallery = [];
      }
      
      business.images.gallery.push(...galleryImages);
      uploadedImages.gallery = galleryImages;
    }

    await business.save();

    res.json({
      success: true,
      message: 'Business images uploaded successfully',
      data: {
        uploadedImages,
        businessImages: {
          logo: business.images.logo,
          cover: business.images.cover,
          gallery: business.images.gallery
        }
      }
    });

  } catch (error) {
    console.error('Upload business images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload business images'
    });
  }
};

// Delete business gallery image
export const deleteBusinessGalleryImage = async (req, res) => {
  try {
    const { businessId, imageUrl } = req.params;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user owns this business
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove from gallery array
    const decodedImageUrl = decodeURIComponent(imageUrl);
    business.images.gallery = business.images.gallery.filter(img => img !== decodedImageUrl);

    // Delete from Cloudinary
    const publicId = uploadUtils.extractPublicId(decodedImageUrl);
    if (publicId) {
      await uploadUtils.deleteFile(publicId);
    }

    await business.save();

    res.json({
      success: true,
      message: 'Gallery image deleted successfully',
      data: {
        remainingGallery: business.images.gallery
      }
    });

  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image'
    });
  }
};

// Get upload progress (for large files)
export const getUploadProgress = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // In a real implementation, you would track upload progress
    // This is a placeholder for demonstration
    res.json({
      success: true,
      data: {
        uploadId,
        progress: 100, // Percentage
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Get upload progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload progress'
    });
  }
};

// Upload menu item images
export const uploadMenuItemImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only business owners can upload menu item images.'
      });
    }

    // Find business owned by the user
    let business;
    if (user.businessProfile && user.businessProfile.businessId) {
      business = await Business.findById(user.businessProfile.businessId);
    } else {
      business = await Business.findOne({ owner: user._id });
    }
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found. Please complete your business setup before uploading menu images.',
        needsBusinessSetup: true
      });
    }

    // Process uploaded images
    const uploadedImages = [];
    if (req.files.menuImages) {
      req.files.menuImages.forEach(file => {
        uploadedImages.push({
          url: file.path,
          thumbnailUrl: uploadUtils.generateThumbnail(file.filename)
        });
      });
    }

    res.json({
      success: true,
      message: 'Menu item images uploaded successfully',
      data: {
        images: uploadedImages
      }
    });

  } catch (error) {
    console.error('Upload menu item images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload menu item images'
    });
  }
};
