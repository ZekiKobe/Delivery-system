import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Truck,
  CheckCircle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context';
import { Button, Input, Card } from '../../components/ui';
import { isValidEmail, isValidPhone } from '../../utils';

const DeliveryPersonRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    licenseNumber: '',
    licenseExpiry: '',
    insuranceNumber: '',
    workingAreas: [{ city: '', radius: 10 }],
    emergencyContact: {
      name: '',
      phone: ''
    },
    agreeToTerms: false
  });
  
  const [files, setFiles] = useState({
    licenseDocument: null,
    insuranceDocument: null
  });
  
  const [uploadProgress, setUploadProgress] = useState({
    licenseDocument: 0,
    insuranceDocument: 0
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const vehicleTypes = [
    { value: 'bike', label: 'Bicycle', icon: '🚲' },
    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'van', label: 'Van', icon: '🚐' },
    { value: 'truck', label: 'Truck', icon: '🚚' },
    { value: 'walking', label: 'Walking', icon: '🚶' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
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
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: 'File size must be less than 10MB' }));
        return;
      }
      
      setFiles(prev => ({ ...prev, [name]: file }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const uploadDocuments = async (userId, token) => {
    if (!files.licenseDocument && !files.insuranceDocument) {
      return { success: true };
    }

    try {
      const formData = new FormData();
      
      if (files.licenseDocument) {
        formData.append('licenseDocument', files.licenseDocument);
      }
      
      if (files.insuranceDocument) {
        formData.append('insuranceDocument', files.insuranceDocument);
      }

      const response = await fetch('/api/upload/license-documents', {
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
      console.error('Upload documents error:', error);
      throw error;
    }
  };

  const handleWorkingAreaChange = (index, field, value) => {
    const newAreas = [...formData.workingAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setFormData(prev => ({ ...prev, workingAreas: newAreas }));
  };

  const addWorkingArea = () => {
    setFormData(prev => ({
      ...prev,
      workingAreas: [...prev.workingAreas, { city: '', radius: 10 }]
    }));
  };

  const removeWorkingArea = (index) => {
    if (formData.workingAreas.length > 1) {
      const newAreas = formData.workingAreas.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, workingAreas: newAreas }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 9) {
        newErrors.phone = 'Phone number is too short';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Please select a vehicle type';
    }
    
    // Validate license fields only for non-walking vehicle types
    if (formData.vehicleType && formData.vehicleType !== 'walking') {
      if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required for this vehicle type';
      }
      
      if (!formData.licenseExpiry) {
        newErrors.licenseExpiry = 'License expiry date is required';
      } else {
        const expiryDate = new Date(formData.licenseExpiry);
        if (expiryDate <= new Date()) {
          newErrors.licenseExpiry = 'License must not be expired';
        }
      }
    }
    
    // Validate insurance for specific vehicle types
    if (['car', 'van', 'truck', 'motorcycle'].includes(formData.vehicleType)) {
      if (!formData.insuranceNumber || !formData.insuranceNumber.trim()) {
        newErrors.insuranceNumber = 'Insurance number is required for this vehicle type';
      }
    }
    
    // File validation - documents are optional but recommended
    if (formData.vehicleType && formData.vehicleType !== 'walking') {
      if (!files.licenseDocument) {
        console.warn('License document not uploaded - user can upload later');
      }
    }
    
    if (['car', 'van', 'truck', 'motorcycle'].includes(formData.vehicleType)) {
      if (!files.insuranceDocument) {
        console.warn('Insurance document not uploaded - user can upload later');
      }
    }
    
    if (!formData.emergencyContact.name.trim()) {
      newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    }
    
    if (!formData.emergencyContact.phone.trim()) {
      newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
    }
    
    if (formData.workingAreas.some(area => !area.city.trim())) {
      newErrors.workingAreas = 'All working area cities must be specified';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Build delivery person profile based on vehicle type
      const deliveryPersonProfile = {
        vehicleType: formData.vehicleType,
        workingAreas: formData.workingAreas,
        emergencyContact: formData.emergencyContact,
        backgroundCheckStatus: 'pending'
      };

      // Add license fields only if vehicle type is not 'walking'
      if (formData.vehicleType !== 'walking') {
        deliveryPersonProfile.licenseNumber = formData.licenseNumber;
        deliveryPersonProfile.licenseExpiry = formData.licenseExpiry;
      }

      // Add insurance field for vehicle types that require it
      if (['car', 'van', 'truck', 'motorcycle'].includes(formData.vehicleType)) {
        deliveryPersonProfile.insuranceNumber = formData.insuranceNumber;
      }

      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone.startsWith('+') ? formData.phone : `+251${formData.phone.replace(/^0/, '')}`,
        password: formData.password,
        role: 'delivery_person',
        deliveryPersonProfile
      };

      console.log('Submitting user data:', userData); // Debug log
      
      const registrationResult = await register(userData);
      
      // Upload documents if registration was successful
      if (registrationResult && registrationResult.token) {
        try {
          await uploadDocuments(registrationResult.user.id, registrationResult.token);
          toast.success('Registration successful! Your application and documents are under review.');
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          toast.success('Registration successful! Please upload your documents from your profile.');
        }
      } else {
        toast.success('Registration successful! Your application is under review.');
      }
      
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const currentStrength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <Card.Content className="p-6 sm:p-8">
              {/* Logo and Header */}
              <div className="text-center mb-6 sm:mb-8">
                <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 sm:p-3 rounded-xl">
                    <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    FastDrop Delivery
                  </span>
                </Link>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Become a Delivery Partner
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Join our delivery network and start earning on your schedule
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      leftIcon={<User className="h-5 w-5" />}
                    />

                    <Input
                      type="text"
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      leftIcon={<User className="h-5 w-5" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      name="email"
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      leftIcon={<Mail className="h-5 w-5" />}
                    />

                    <Input
                      type="tel"
                      name="phone"
                      label="Phone Number"
                      placeholder="+251 9X XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      leftIcon={<Phone className="h-5 w-5" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        }
                      />
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${getStrengthColor(currentStrength)}`}
                                style={{ width: `${(currentStrength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {getStrengthText(currentStrength)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      leftIcon={<Lock className="h-5 w-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Vehicle Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {vehicleTypes.map((vehicle) => (
                        <label
                          key={vehicle.value}
                          className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.vehicleType === vehicle.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="vehicleType"
                            value={vehicle.value}
                            checked={formData.vehicleType === vehicle.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-xl sm:text-2xl">{vehicle.icon}</span>
                          <span className="text-xs sm:text-sm font-medium">{vehicle.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.vehicleType && (
                      <p className="text-sm text-red-600 mt-1">{errors.vehicleType}</p>
                    )}
                  </div>

                  {formData.vehicleType && formData.vehicleType !== 'walking' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        name="licenseNumber"
                        label="License Number"
                        placeholder="Enter your license number"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        error={errors.licenseNumber}
                        leftIcon={<FileText className="h-5 w-5" />}
                      />

                      <Input
                        type="date"
                        name="licenseExpiry"
                        label="License Expiry Date"
                        value={formData.licenseExpiry}
                        onChange={handleChange}
                        error={errors.licenseExpiry}
                      />
                    </div>
                  )}

                  {['car', 'van', 'truck', 'motorcycle'].includes(formData.vehicleType) && (
                    <Input
                      type="text"
                      name="insuranceNumber"
                      label="Insurance Number"
                      placeholder="Enter your insurance number"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                      error={errors.insuranceNumber}
                      leftIcon={<FileText className="h-5 w-5" />}
                    />
                  )}

                  {/* Document Upload Section */}
                  {formData.vehicleType && formData.vehicleType !== 'walking' && (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Required Documents</h4>
                      
                      {/* License Document Upload */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Driver's License Document *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name="licenseDocument"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        {files.licenseDocument && (
                          <p className="text-xs sm:text-sm text-green-600">
                            ✓ {files.licenseDocument.name}
                          </p>
                        )}
                        {errors.licenseDocument && (
                          <p className="text-xs sm:text-sm text-red-600">{errors.licenseDocument}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Upload a clear photo or scan of your driver's license (JPG, PNG, or PDF, max 10MB)
                        </p>
                      </div>

                      {/* Insurance Document Upload */}
                      {['car', 'van', 'truck', 'motorcycle'].includes(formData.vehicleType) && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Vehicle Insurance Document *
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              name="insuranceDocument"
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </div>
                          {files.insuranceDocument && (
                            <p className="text-xs sm:text-sm text-green-600">
                              ✓ {files.insuranceDocument.name}
                            </p>
                          )}
                          {errors.insuranceDocument && (
                            <p className="text-xs sm:text-sm text-red-600">{errors.insuranceDocument}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Upload your current vehicle insurance certificate (JPG, PNG, or PDF, max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Working Areas */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Working Areas</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWorkingArea}
                    >
                      Add Area
                    </Button>
                  </div>
                  
                  {formData.workingAreas.map((area, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <Input
                        type="text"
                        label="City"
                        placeholder="Enter city name"
                        value={area.city}
                        onChange={(e) => handleWorkingAreaChange(index, 'city', e.target.value)}
                        leftIcon={<MapPin className="h-5 w-5" />}
                      />
                      
                      <Input
                        type="number"
                        label="Radius (km)"
                        placeholder="10"
                        value={area.radius}
                        onChange={(e) => handleWorkingAreaChange(index, 'radius', parseInt(e.target.value))}
                        min="1"
                        max="50"
                      />
                      
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeWorkingArea(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {errors.workingAreas && (
                    <p className="text-sm text-red-600">{errors.workingAreas}</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="emergencyContact.name"
                      label="Contact Name"
                      placeholder="Enter emergency contact name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      error={errors['emergencyContact.name']}
                      leftIcon={<User className="h-5 w-5" />}
                    />

                    <Input
                      type="tel"
                      name="emergencyContact.phone"
                      label="Contact Phone"
                      placeholder="+251 9X XXX XXXX"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      error={errors['emergencyContact.phone']}
                      leftIcon={<Phone className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mt-1 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/terms-delivery" className="text-blue-600 hover:text-blue-700 underline">
                        Delivery Partner Terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full text-base sm:text-lg py-2.5 sm:py-3"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
        
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 sm:mt-6"
        >
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-1 text-sm"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryPersonRegistration;