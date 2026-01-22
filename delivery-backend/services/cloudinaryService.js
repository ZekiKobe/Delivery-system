import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      };

      cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, options)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Get image URL with transformations
export const getTransformedImageUrl = (publicId, transformations = {}) => {
  try {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations
    });
  } catch (error) {
    console.error('Image transformation error:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Extract public ID error:', error);
    return null;
  }
};