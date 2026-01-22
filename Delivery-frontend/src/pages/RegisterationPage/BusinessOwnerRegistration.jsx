import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Store,
  CheckCircle, FileText, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context';
import { Button, Input, Card } from '../../components/ui';
import { isValidEmail } from '../../utils';

const BusinessOwnerRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    businessName: '', businessType: '', description: '', categories: [''],
    address: { street: '', city: '', state: '', zipCode: '' },
    businessPhone: '', businessEmail: '', website: '',
    deliveryInfo: { deliveryRadius: 10, minimumOrder: 0, deliveryFee: 0, freeDeliveryThreshold: 50 },
    documents: { businessLicense: '', taxId: '' },
    bankDetails: { accountHolder: '', accountNumber: '', bankName: '' },
    agreeToTerms: false
  });
  
  const [files, setFiles] = useState({
    businessLicense: null,
    taxDocument: null
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register, loading, dispatch } = useAuth();
  const navigate = useNavigate();

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'other', label: 'Other', icon: '🏪' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [name]: 'Please upload a valid image (JPG, PNG) or PDF file' }));
        return;
      }
      
      // Validate file size (15MB max for business documents)
      if (file.size > 15 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: 'File size must be less than 15MB' }));
        return;
      }
      
      setFiles(prev => ({ ...prev, [name]: file }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const uploadBusinessDocuments = async (userId, token) => {
    if (!files.businessLicense && !files.taxDocument) {
      return { success: true };
    }

    try {
      const formData = new FormData();
      
      if (files.businessLicense) {
        formData.append('businessLicense', files.businessLicense);
      }
      
      if (files.taxDocument) {
        formData.append('taxDocument', files.taxDocument);
      }

      const response = await fetch('/api/upload/business-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload documents');
      }

      return data;
    } catch (error) {
      console.error('Upload business documents error:', error);
      throw error;
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.description.trim()) newErrors.description = 'Business description is required';
      if (!formData.address.street.trim()) newErrors.address = 'Business address is required';
      if (!formData.address.city.trim()) newErrors.city = 'City is required';
      if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
    } else if (step === 3) {
      if (!formData.documents.businessLicense.trim()) newErrors.businessLicense = 'Business license number is required';
      if (!formData.documents.taxId.trim()) newErrors.taxId = 'Tax ID is required';
      if (!formData.bankDetails.accountHolder.trim()) newErrors.accountHolder = 'Account holder name is required';
      if (!formData.bankDetails.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
      if (!formData.bankDetails.bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      
      // Check if required documents are uploaded
      if (!files.businessLicense) newErrors.businessLicenseFile = 'Business license document is required';
      if (!files.taxDocument) newErrors.taxDocumentFile = 'Tax document is required';
    }
    
    return newErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    // Only allow navigation to step 3, not beyond
    if (currentStep < 3) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submitting
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Stay on the current step to show errors
      if (Object.keys(step3Errors).length > 0) {
        setCurrentStep(3);
      } else if (Object.keys(step2Errors).length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
      toast.error('Please complete all required fields');
      return;
    }
    
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone.startsWith('+') ? formData.phone : `+251${formData.phone.replace(/^0/, '')}`,
        password: formData.password,
        role: 'business_owner',
        businessProfile: {
          businessType: formData.businessType,
          verificationStatus: 'pending'
        }
      };
      
      const registrationResult = await register(userData);
      
      // Upload business documents if registration was successful
      if (registrationResult && registrationResult.data && registrationResult.data.token) {
        try {
          await uploadBusinessDocuments(registrationResult.data.user.id, registrationResult.data.token);
          toast.success('Registration successful! Your business application and documents are under review.');
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          toast.success('Registration successful! Please upload your business documents from your profile.');
        }
        
        // Now log in the user and navigate to dashboard
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: registrationResult.data.user
        });
      } else {
        toast.success('Registration successful! Your business application is under review.');
      }
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="text" name="firstName" label="First Name" placeholder="Enter your first name"
              value={formData.firstName} onChange={handleChange} error={errors.firstName}
              leftIcon={<User className="h-5 w-5" />} />
            <Input type="text" name="lastName" label="Last Name" placeholder="Enter your last name"
              value={formData.lastName} onChange={handleChange} error={errors.lastName}
              leftIcon={<User className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="email" name="email" label="Email Address" placeholder="Enter your email"
              value={formData.email} onChange={handleChange} error={errors.email}
              leftIcon={<Mail className="h-5 w-5" />} />
            <Input type="tel" name="phone" label="Phone Number" placeholder="+251 9X XXX XXXX"
              value={formData.phone} onChange={handleChange} error={errors.phone}
              leftIcon={<Phone className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type={showPassword ? 'text' : 'password'} name="password" label="Password"
              placeholder="Create a strong password" value={formData.password} onChange={handleChange}
              error={errors.password} leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>} />
            <Input type="password" name="confirmPassword" label="Confirm Password"
              placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange}
              error={errors.confirmPassword} leftIcon={<Lock className="h-5 w-5" />} />
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
          
          <Input type="text" name="businessName" label="Business Name" placeholder="Enter your business name"
            value={formData.businessName} onChange={handleChange} error={errors.businessName}
            leftIcon={<Store className="h-5 w-5" />} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Business Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {businessTypes.map((type) => (
                <label key={type.value} className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.businessType === type.value ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                  }`}>
                  <input type="radio" name="businessType" value={type.value}
                    checked={formData.businessType === type.value} onChange={handleChange} className="sr-only" />
                  <span className="text-xl sm:text-2xl">{type.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.businessType && (
              <p className="text-sm text-red-600 mt-1">{errors.businessType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Describe your business and what you offer..." rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <Input type="text" name="address.street" label="Business Address" placeholder="Enter street address"
            value={formData.address.street} onChange={handleChange} error={errors.address}
            leftIcon={<MapPin className="h-5 w-5" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="text" name="address.city" label="City" placeholder="Enter city"
              value={formData.address.city} onChange={handleChange} error={errors.city} />
            <Input type="tel" name="businessPhone" label="Business Phone" placeholder="+251 11 XXX XXXX"
              value={formData.businessPhone} onChange={handleChange} error={errors.businessPhone}
              leftIcon={<Phone className="h-5 w-5" />} />
          </div>
        </div>
      );
    }

    // Step 3 - Documents & Settings
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Documents & Settings</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input type="text" name="documents.businessLicense" label="Business License Number"
            placeholder="Enter license number" value={formData.documents.businessLicense} onChange={handleChange}
            error={errors.businessLicense} leftIcon={<FileText className="h-5 w-5" />} />
          <Input type="text" name="documents.taxId" label="Tax ID Number" placeholder="Enter tax ID"
            value={formData.documents.taxId} onChange={handleChange} error={errors.taxId} 
            leftIcon={<FileText className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input type="number" name="deliveryInfo.deliveryRadius" label="Delivery Radius (km)" placeholder="10"
            value={formData.deliveryInfo.deliveryRadius} onChange={handleChange} min="1" max="50" />
          <Input type="number" name="deliveryInfo.deliveryFee" label="Delivery Fee (ETB)" placeholder="25"
            value={formData.deliveryInfo.deliveryFee} onChange={handleChange} min="0"
            leftIcon={<DollarSign className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input type="text" name="bankDetails.accountHolder" label="Account Holder Name"
            placeholder="Enter account holder name" value={formData.bankDetails.accountHolder} onChange={handleChange}
            error={errors.accountHolder} />
          <Input type="text" name="bankDetails.accountNumber" label="Account Number"
            placeholder="Enter account number" value={formData.bankDetails.accountNumber} onChange={handleChange}
            error={errors.accountNumber} />
        </div>

        <Input type="text" name="bankDetails.bankName" label="Bank Name" placeholder="Enter bank name"
          value={formData.bankDetails.bankName} onChange={handleChange} error={errors.bankName} />

        {/* Document Upload Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Required Business Documents</h4>
          
          {/* Business License Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Business License Document *
            </label>
            <div className="relative">
              <input
                type="file"
                name="businessLicense"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            {files.businessLicense && (
              <p className="text-xs sm:text-sm text-green-600">
                ✓ {files.businessLicense.name}
              </p>
            )}
            {errors.businessLicenseFile && (
              <p className="text-xs sm:text-sm text-red-600">{errors.businessLicenseFile}</p>
            )}
            <p className="text-xs text-gray-500">
              Upload your official business license (JPG, PNG, or PDF, max 15MB)
            </p>
          </div>

          {/* Tax Document Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tax Registration Document *
            </label>
            <div className="relative">
              <input
                type="file"
                name="taxDocument"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            {files.taxDocument && (
              <p className="text-xs sm:text-sm text-green-600">
                ✓ {files.taxDocument.name}
              </p>
            )}
            {errors.taxDocumentFile && (
              <p className="text-xs sm:text-sm text-red-600">{errors.taxDocumentFile}</p>
            )}
            <p className="text-xs text-gray-500">
              Upload your tax registration certificate (JPG, PNG, or PDF, max 15MB)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
              className="rounded border-gray-300 text-green-500 focus:ring-green-500 mt-1 w-4 h-4" />
            <span className="text-xs sm:text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms-business" className="text-green-600 hover:text-green-700 underline">
                Business Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-green-600 hover:text-green-700 underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-xs sm:text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <Card.Content className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 sm:p-3 rounded-xl">
                    <Store className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    FastDrop Business
                  </span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Register Your Business</h1>
                <p className="text-gray-600 text-sm sm:text-base">Join our delivery network and reach more customers</p>
              </div>

              {/* Progress */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`flex items-center ${
                      step < 3 ? 'flex-1' : ''
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs sm:text-sm ${
                        currentStep >= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                          currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderStep()}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="w-full sm:w-auto">
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} className={`w-full sm:w-auto ${currentStep === 1 ? 'sm:ml-auto' : ''}`}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" loading={loading} rightIcon={<ArrowRight className="h-5 w-5" />}
                      className="w-full sm:w-auto sm:ml-auto">
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </form>

              {/* Links */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessOwnerRegistration;