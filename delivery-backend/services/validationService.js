import User from '../models/User.js';
import Business from '../models/Business.js';
import { uploadToCloudinary } from './cloudinaryService.js';

/**
 * Check if email is already registered
 */
export const isEmailRegistered = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return !!user;
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
};

/**
 * Check if phone number is already registered
 */
export const isPhoneRegistered = async (phone) => {
  try {
    const user = await User.findOne({ where: { phone } });
    return !!user;
  } catch (error) {
    console.error('Phone validation error:', error);
    return false;
  }
};

/**
 * Validate Ethiopian phone number format
 */
export const isValidEthiopianPhone = (phone) => {
  // Ethiopian phone numbers typically start with +251 or 0 and have 9-10 digits
  const ethiopianPhoneRegex = /^(\+251|0)?[9|7]\d{8}$/;
  return ethiopianPhoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const isPasswordStrong = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validation and Verification Service
 * Handles role-specific validation and verification workflows
 */

// User role validation rules
export const validationRules = {
  customer: {
    required: ['firstName', 'lastName', 'email', 'phone'],
    optional: ['addresses'],
    documents: [],
    verification: {
      email: true,
      phone: true,
      identity: false,
      background: false
    }
  },
  delivery_person: {
    required: ['firstName', 'lastName', 'email', 'phone', 'deliveryPersonProfile'],
    optional: ['emergencyContact'],
    documents: ['licenseDocument', 'insuranceDocument', 'profilePhoto'],
    verification: {
      email: true,
      phone: true,
      identity: true,
      background: true,
      documents: true
    },
    profileRequirements: {
      vehicleType: ['walking', 'bicycle', 'motorcycle', 'car'],
      licenseRequired: ['motorcycle', 'car'],
      workingAreas: true,
      emergencyContact: true
    }
  },
  business_owner: {
    required: ['firstName', 'lastName', 'email', 'phone', 'businessProfile'],
    optional: ['businessAddress'],
    documents: ['businessLicense', 'taxDocument', 'identityDocument'],
    verification: {
      email: true,
      phone: true,
      identity: true,
      business: true,
      documents: true
    },
    profileRequirements: {
      businessType: true,
      businessRegistration: true,
      taxCompliance: true
    }
  },
  admin: {
    required: ['firstName', 'lastName', 'email', 'phone'],
    optional: [],
    documents: [],
    verification: {
      email: true,
      phone: true,
      identity: true,
      twoFactor: true
    }
  }
};

// Business type specific requirements
export const businessTypeRequirements = {
  restaurant: {
    licenses: ['businessLicense', 'foodServiceLicense', 'alcoholLicense'],
    documents: ['menuCard', 'healthCertificate'],
    additionalInfo: ['cuisineType', 'seatingCapacity', 'kitchenType']
  },
  pharmacy: {
    licenses: ['businessLicense', 'pharmacyLicense', 'healthDepartmentPermit'],
    documents: ['pharmacistLicense', 'drugStorePermit'],
    additionalInfo: ['pharmacistOnDuty', 'emergencyServices']
  },
  grocery: {
    licenses: ['businessLicense', 'foodRetailLicense'],
    documents: ['supplierCertificates', 'healthCertificate'],
    additionalInfo: ['productCategories', 'storageCapacity']
  },
  medical: {
    licenses: ['businessLicense', 'medicalFacilityLicense', 'healthDepartmentPermit'],
    documents: ['doctorLicenses', 'medicalEquipmentCertificates'],
    additionalInfo: ['medicalSpecialties', 'emergencyServices']
  },
  alcohol: {
    licenses: ['businessLicense', 'alcoholRetailLicense', 'ageVerificationSystem'],
    documents: ['supplierPermits', 'responsibleServiceCertificate'],
    additionalInfo: ['ageVerificationMethod', 'operatingHours']
  },
  other: {
    licenses: ['businessLicense'],
    documents: ['productCertificates'],
    additionalInfo: ['businessDescription', 'productTypes']
  }
};

/**
 * Validate user registration data based on role
 */
export const validateUserRegistration = async (userData, role) => {
  const rules = validationRules[role];
  if (!rules) {
    throw new Error(`Unknown user role: ${role}`);
  }

  const errors = [];
  
  // Check required fields
  for (const field of rules.required) {
    if (!userData[field]) {
      errors.push(`${field} is required for ${role} registration`);
    }
  }

  // Role-specific validation
  switch (role) {
    case 'delivery_person':
      errors.push(...validateDeliveryPersonProfile(userData.deliveryPersonProfile));
      break;
    case 'business_owner':
      errors.push(...validateBusinessProfile(userData.businessProfile));
      break;
  }

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { phone: userData.phone }]
  });

  if (existingUser) {
    errors.push('User with this email or phone already exists');
  }

  return {
    isValid: errors.length === 0,
    errors,
    requiredDocuments: rules.documents,
    verificationSteps: rules.verification
  };
};

/**
 * Validate delivery person profile
 */
export const validateDeliveryPersonProfile = (profile) => {
  const errors = [];
  
  if (!profile) {
    errors.push('Delivery person profile is required');
    return errors;
  }

  const { vehicleType, licenseNumber, licenseExpiry, workingAreas, emergencyContact } = profile;

  // Vehicle type validation
  if (!vehicleType || !['walking', 'bicycle', 'motorcycle', 'car'].includes(vehicleType)) {
    errors.push('Valid vehicle type is required');
  }

  // License validation for motorized vehicles
  if (['motorcycle', 'car'].includes(vehicleType)) {
    if (!licenseNumber) {
      errors.push('License number is required for motorized vehicles');
    }
    if (!licenseExpiry) {
      errors.push('License expiry date is required for motorized vehicles');
    } else if (new Date(licenseExpiry) <= new Date()) {
      errors.push('License must not be expired');
    }
  }

  // Working areas validation
  if (!workingAreas || !Array.isArray(workingAreas) || workingAreas.length === 0) {
    errors.push('At least one working area is required');
  }

  // Emergency contact validation
  if (!emergencyContact || !emergencyContact.name || !emergencyContact.phone) {
    errors.push('Emergency contact information is required');
  }

  return errors;
};

/**
 * Validate business profile
 */
export const validateBusinessProfile = (profile) => {
  const errors = [];
  
  if (!profile) {
    errors.push('Business profile is required');
    return errors;
  }

  const { businessType } = profile;

  if (!businessType) {
    errors.push('Business type is required');
  }

  return errors;
};

/**
 * Validate business registration
 */
export const validateBusinessRegistration = async (businessData) => {
  const errors = [];
  const { businessType, name, address, contact, documents } = businessData;

  // Basic validation
  if (!name || name.trim().length < 2) {
    errors.push('Business name must be at least 2 characters');
  }

  if (!businessType) {
    errors.push('Business type is required');
  }

  if (!address || !address.coordinates || !address.coordinates.lat || !address.coordinates.lng) {
    errors.push('Valid business address with coordinates is required');
  }

  if (!contact || !contact.phone || !contact.email) {
    errors.push('Business contact information is required');
  }

  // Check for existing business name
  const existingBusiness = await Business.findOne({ 
    name: new RegExp(`^${name.trim()}$`, 'i') 
  });

  if (existingBusiness) {
    errors.push('Business with this name already exists');
  }

  // Business type specific validation
  const typeRequirements = businessTypeRequirements[businessType] || businessTypeRequirements.other;
  
  if (documents) {
    const missingDocs = typeRequirements.licenses.filter(license => !documents[license]);
    if (missingDocs.length > 0) {
      errors.push(`Missing required documents: ${missingDocs.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    requiredDocuments: typeRequirements.licenses,
    additionalRequirements: typeRequirements.additionalInfo
  };
};

/**
 * Document verification workflow
 */
export const verifyDocuments = async (userId, documents, documentType) => {
  try {
    const verificationResults = {};

    for (const [docName, docFile] of Object.entries(documents)) {
      // Upload document to secure storage
      const uploadResult = await uploadToCloudinary(docFile, {
        folder: `documents/${documentType}/${userId}`,
        resource_type: 'auto'
      });

      // AI/Manual verification can be implemented here
      verificationResults[docName] = {
        url: uploadResult.secure_url,
        status: 'pending', // pending, approved, rejected
        uploadedAt: new Date(),
        verifiedAt: null,
        verificationNotes: ''
      };
    }

    return {
      success: true,
      documents: verificationResults
    };

  } catch (error) {
    console.error('Document verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Background check workflow
 */
export const initiateBackgroundCheck = async (userId, personalInfo) => {
  try {
    // This would integrate with background check services
    // For now, we'll simulate the process
    
    const backgroundCheck = {
      userId,
      status: 'pending', // pending, in_progress, completed, failed
      requestedAt: new Date(),
      completedAt: null,
      results: {
        criminalRecord: null,
        drivingRecord: null,
        identity: null
      },
      notes: 'Background check initiated'
    };

    // In a real implementation, this would call external APIs
    // like Checkr, Sterling, or local government databases

    return {
      success: true,
      backgroundCheckId: `BG_${Date.now()}`,
      estimatedCompletion: '2-5 business days',
      status: 'pending'
    };

  } catch (error) {
    console.error('Background check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Business verification workflow
 */
export const verifyBusiness = async (businessId, adminUserId) => {
  try {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Verification checklist
    const verificationChecklist = {
      businessLicense: business.documents?.businessLicense ? 'verified' : 'missing',
      taxCompliance: business.documents?.taxDocument ? 'verified' : 'missing',
      addressVerification: business.address?.coordinates ? 'verified' : 'missing',
      contactVerification: 'pending',
      ownerVerification: 'pending'
    };

    // Update business verification status
    business.verificationStatus = 'under_review';
    business.verificationChecklist = verificationChecklist;
    business.verifiedBy = adminUserId;
    business.verificationDate = new Date();

    await business.save();

    return {
      success: true,
      verificationStatus: 'under_review',
      checklist: verificationChecklist
    };

  } catch (error) {
    console.error('Business verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get verification requirements for role
 */
export const getVerificationRequirements = (role, businessType = null) => {
  const roleRules = validationRules[role];
  if (!roleRules) {
    throw new Error(`Unknown role: ${role}`);
  }

  let requirements = {
    role,
    documents: roleRules.documents,
    verification: roleRules.verification,
    profile: roleRules.profileRequirements || {}
  };

  // Add business-specific requirements for business owners
  if (role === 'business_owner' && businessType) {
    const businessReqs = businessTypeRequirements[businessType] || businessTypeRequirements.other;
    requirements.businessDocuments = businessReqs.licenses;
    requirements.additionalInfo = businessReqs.additionalInfo;
  }

  return requirements;
};

/**
 * Check verification status
 */
export const checkVerificationStatus = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate('businessProfile.businessId');

    if (!user) {
      throw new Error('User not found');
    }

    const status = {
      userId,
      role: user.role,
      email: user.isEmailVerified,
      phone: user.isPhoneVerified,
      profile: 'complete',
      documents: 'pending',
      background: 'pending',
      overall: 'pending'
    };

    // Role-specific status checks
    switch (user.role) {
      case 'delivery_person':
        status.documents = user.deliveryPersonProfile?.documentVerificationStatus || 'pending';
        status.background = user.deliveryPersonProfile?.backgroundCheckStatus || 'pending';
        break;
      
      case 'business_owner':
        if (user.businessProfile?.businessId) {
          const business = user.businessProfile.businessId;
          status.business = business.verificationStatus || 'pending';
          status.documents = business.documents ? 'submitted' : 'pending';
        }
        break;
    }

    // Calculate overall status
    const allCompleted = Object.values(status)
      .filter(val => typeof val === 'string' && val !== userId && val !== user.role)
      .every(val => ['complete', 'verified', 'approved'].includes(val));

    status.overall = allCompleted ? 'verified' : 'pending';

    return status;

  } catch (error) {
    console.error('Check verification status error:', error);
    throw error;
  }
};

export default {
  // Validation functions
  isEmailRegistered,
  isPhoneRegistered,
  isValidEthiopianPhone,
  isPasswordStrong,
  
  // Verification and validation services
  validateUserRegistration,
  validateBusinessRegistration,
  verifyDocuments,
  initiateBackgroundCheck,
  verifyBusiness,
  getVerificationRequirements,
  checkVerificationStatus,
  
  // Configuration objects
  validationRules,
  businessTypeRequirements
};