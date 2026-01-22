import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File type validation
const allowedFileTypes = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  documents: ['pdf', 'doc', 'docx', 'txt'],
  licenses: ['jpg', 'jpeg', 'png', 'pdf']
};

const validateFileType = (file, allowedTypes) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  return allowedTypes.includes(fileExtension);
};

// Create storage configuration for different file types
const createCloudinaryStorage = (folder, allowedTypes) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `fastdrop/${folder}`,
      allowed_formats: allowedTypes,
      resource_type: 'auto',
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = path.parse(file.originalname).name;
        return `${originalName}_${timestamp}`;
      }
    }
  });
};

// Storage configurations
const profileImageStorage = createCloudinaryStorage('profiles', allowedFileTypes.images);
const licenseStorage = createCloudinaryStorage('licenses', allowedFileTypes.licenses);
const businessDocumentStorage = createCloudinaryStorage('business-documents', allowedFileTypes.documents.concat(allowedFileTypes.images));
const menuImageStorage = createCloudinaryStorage('menu-items', allowedFileTypes.images);
const businessImageStorage = createCloudinaryStorage('business-images', allowedFileTypes.images);

// File size limits (in bytes)
const fileSizeLimits = {
  profile: 5 * 1024 * 1024, // 5MB
  license: 10 * 1024 * 1024, // 10MB
  document: 15 * 1024 * 1024, // 15MB
  image: 8 * 1024 * 1024 // 8MB
};

// File filter function
const createFileFilter = (allowedTypes, maxSize) => {
  return (req, file, cb) => {
    // Check file type
    if (!validateFileType(file, allowedTypes)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }

    // File size is checked by multer limits, but we can add custom logic here
    cb(null, true);
  };
};

// Upload configurations
export const uploadConfigs = {
  // Profile image upload
  profileImage: multer({
    storage: profileImageStorage,
    limits: {
      fileSize: fileSizeLimits.profile,
      files: 1
    },
    fileFilter: createFileFilter(allowedFileTypes.images, fileSizeLimits.profile)
  }),

  // License document upload (for delivery persons)
  licenseDocument: multer({
    storage: licenseStorage,
    limits: {
      fileSize: fileSizeLimits.license,
      files: 3 // License front, back, and insurance
    },
    fileFilter: createFileFilter(allowedFileTypes.licenses, fileSizeLimits.license)
  }),

  // Business documents upload
  businessDocuments: multer({
    storage: businessDocumentStorage,
    limits: {
      fileSize: fileSizeLimits.document,
      files: 5 // Multiple business documents
    },
    fileFilter: createFileFilter(
      allowedFileTypes.documents.concat(allowedFileTypes.images),
      fileSizeLimits.document
    )
  }),

  // Menu item images
  menuImages: multer({
    storage: menuImageStorage,
    limits: {
      fileSize: fileSizeLimits.image,
      files: 5 // Multiple images per menu item
    },
    fileFilter: createFileFilter(allowedFileTypes.images, fileSizeLimits.image)
  }),

  // Business profile images (logo, cover, gallery)
  businessImages: multer({
    storage: businessImageStorage,
    limits: {
      fileSize: fileSizeLimits.image,
      files: 10 // Logo, cover, and gallery images
    },
    fileFilter: createFileFilter(allowedFileTypes.images, fileSizeLimits.image)
  })
};

// Utility functions
export const uploadUtils = {
  // Delete file from Cloudinary
  deleteFile: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  },

  // Get optimized image URL
  getOptimizedImageUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };
    
    return cloudinary.url(publicId, defaultOptions);
  },

  // Generate thumbnail
  generateThumbnail: (publicId, width = 150, height = 150) => {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  },

  // Extract public ID from Cloudinary URL
  extractPublicId: (cloudinaryUrl) => {
    if (!cloudinaryUrl) return null;
    
    const matches = cloudinaryUrl.match(/\/([^/]+)\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i);
    return matches ? matches[1] : null;
  },

  // Validate file size before upload
  validateFileSize: (file, maxSize) => {
    return file.size <= maxSize;
  }
};

// Error handling middleware for file uploads
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large',
          error: 'FILE_SIZE_LIMIT_EXCEEDED'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded',
          error: 'FILE_COUNT_LIMIT_EXCEEDED'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field',
          error: 'UNEXPECTED_FILE_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: error.code
        });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Other errors
  return res.status(500).json({
    success: false,
    message: 'File upload failed',
    error: 'UPLOAD_ERROR'
  });
};

// Middleware to handle multiple file uploads with different fields
export const createMultipleUploadMiddleware = (uploadConfig) => {
  return (req, res, next) => {
    const upload = uploadConfig.fields([
      { name: 'licenseDocument', maxCount: 1 },
      { name: 'insuranceDocument', maxCount: 1 },
      { name: 'businessLicense', maxCount: 1 },
      { name: 'taxDocument', maxCount: 1 },
      { name: 'profileImage', maxCount: 1 },
      { name: 'businessLogo', maxCount: 1 },
      { name: 'businessCover', maxCount: 1 },
      { name: 'businessGallery', maxCount: 5 }
    ]);

    upload(req, res, (error) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  };
};

export default {
  uploadConfigs,
  uploadUtils,
  handleUploadError,
  createMultipleUploadMiddleware
};