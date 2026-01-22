import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// Upload verification document
export const uploadVerificationDocument = async (req, res) => {
  try {
    const { businessId, documentType } = req.params;
    const { documentNumber } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
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
      folder: `businesses/${businessId}/verification`,
      resource_type: 'raw' // For documents
    });

    // Update business verification documents
    business.documents = business.documents || {};
    
    if (documentType === 'businessLicense') {
      business.documents.businessLicense = result.secure_url;
      if (documentNumber) {
        business.documents.businessLicenseNumber = documentNumber;
      }
    } else if (documentType === 'taxId') {
      business.documents.taxId = result.secure_url;
      if (documentNumber) {
        business.documents.taxIdNumber = documentNumber;
      }
    } else if (documentType === 'bankAccount') {
      business.documents.bankAccount = result.secure_url;
    } else {
      // Business type specific documents
      business.documents[documentType] = result.secure_url;
    }
    
    // Update verification status
    business.verification_status = 'pending';
    
    await business.save();

    res.json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: { 
        business,
        documentUrl: result.secure_url 
      }
    });
  } catch (error) {
    console.error('Upload verification document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload verification document'
    });
  }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const { businessId } = req.params;
    
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

    res.json({
      success: true,
      data: { 
        verificationStatus: business.verification_status,
        documents: business.documents || {}
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status'
    });
  }
};

// Request verification review
export const requestVerificationReview = async (req, res) => {
  try {
    const { businessId } = req.params;
    
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

    // Check if all required documents are uploaded
    const requiredDocuments = ['businessLicense', 'taxId'];
    
    // Add business type specific documents
    if (['restaurant', 'grocery'].includes(business.business_type)) {
      requiredDocuments.push('foodSafetyCertificate');
    } else if (business.business_type === 'pharmacy') {
      requiredDocuments.push('pharmacyLicense');
    } else if (['electronics', 'clothing', 'books'].includes(business.business_type)) {
      requiredDocuments.push('tradeLicense');
    }
    
    const missingDocuments = [];
    const documents = business.documents || {};
    
    requiredDocuments.forEach(doc => {
      if (!documents[doc]) {
        missingDocuments.push(doc);
      }
    });
    
    if (missingDocuments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required documents',
        data: { missingDocuments }
      });
    }

    // Update verification status
    business.verification_status = 'under_review';
    await business.save();

    res.json({
      success: true,
      message: 'Verification review requested successfully',
      data: { 
        verificationStatus: business.verification_status
      }
    });
  } catch (error) {
    console.error('Request verification review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request verification review'
    });
  }
};
