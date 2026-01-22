import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Package, 
  DollarSign,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context';
import { businessDashboardService } from '../../services';
import toast from 'react-hot-toast';

const BusinessSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    businessType: user?.businessProfile?.businessType || '',
    category: [],
          address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Ethiopia',
        coordinates: {
          lat: 0,
          lng: 0
        }
      },
    contact: {
      phone: user?.phone || '',
      email: user?.email || '',
      website: ''
    },
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '22:00' }
    ],
    deliveryInfo: {
      deliveryRadius: 5,
      minimumOrder: 50,
      deliveryFee: 20,
      freeDeliveryThreshold: 200,
      estimatedDeliveryTime: { min: 30, max: 60 },
      deliveryTypes: ['standard']
    },
    settings: {
      acceptsOrders: true,
      autoAcceptOrders: false,
      preparationTime: 30,
      maxOrdersPerHour: 20
    }
  });

  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState({
    logo: null,
    cover: null,
    gallery: []
  });

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant & Food', icon: '🍽️' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing & Fashion', icon: '👕' },
    { value: 'books', label: 'Books & Stationery', icon: '📚' },
    { value: 'flowers', label: 'Flowers & Gifts', icon: '🌸' },
    { value: 'furniture', label: 'Furniture & Home', icon: '🪑' },
    { value: 'hardware', label: 'Hardware & Tools', icon: '🔧' },
    { value: 'pet_supplies', label: 'Pet Supplies', icon: '🐾' },
    { value: 'automotive', label: 'Automotive', icon: '🚗' },
    { value: 'beauty', label: 'Beauty & Cosmetics', icon: '💄' },
    { value: 'sports', label: 'Sports & Fitness', icon: '⚽' },
    { value: 'toys', label: 'Toys & Games', icon: '🎮' },
    { value: 'medical', label: 'Medical Services', icon: '🏥' },
    { value: 'laundry', label: 'Laundry & Cleaning', icon: '🧺' },
    { value: 'catering', label: 'Catering Services', icon: '🍱' },
    { value: 'office_supplies', label: 'Office Supplies', icon: '📎' },
    { value: 'alcohol', label: 'Alcohol & Beverages', icon: '🍷' },
    { value: 'convenience', label: 'Convenience Store', icon: '🏪' },
    { value: 'other', label: 'Other', icon: '🏢' }
  ];

  const categories = {
    restaurant: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts', 'vegetarian', 'vegan', 'gluten-free'],
    grocery: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'canned-goods', 'frozen-foods', 'beverages', 'snacks'],
    pharmacy: ['medicines', 'vitamins', 'first-aid', 'personal-care', 'baby-care', 'health-supplements'],
    electronics: ['phones', 'computers', 'accessories', 'gaming', 'audio', 'cameras', 'home-appliances'],
    clothing: ['men', 'women', 'kids', 'shoes', 'accessories', 'jewelry', 'sports-wear'],
    books: ['fiction', 'non-fiction', 'academic', 'children', 'cooking', 'travel', 'business'],
    flowers: ['bouquets', 'plants', 'gifts', 'decorations', 'wedding', 'anniversary'],
    furniture: ['living-room', 'bedroom', 'kitchen', 'office', 'outdoor', 'decor'],
    hardware: ['tools', 'electrical', 'plumbing', 'paint', 'garden', 'automotive'],
    pet_supplies: ['dog', 'cat', 'bird', 'fish', 'food', 'toys', 'health'],
    automotive: ['parts', 'accessories', 'tools', 'oils', 'tires', 'electronics'],
    beauty: ['skincare', 'makeup', 'haircare', 'fragrances', 'tools', 'bath'],
    sports: ['fitness', 'outdoor', 'team-sports', 'equipment', 'clothing', 'nutrition'],
    toys: ['educational', 'outdoor', 'board-games', 'puzzles', 'building', 'dolls'],
    medical: ['consultation', 'treatment', 'diagnostics', 'therapy', 'prevention'],
    laundry: ['dry-cleaning', 'wash-fold', 'starch', 'express', 'pickup-delivery'],
    catering: ['corporate', 'wedding', 'party', 'buffet', 'plated', 'finger-foods'],
    'office_supplies': ['paper', 'writing', 'filing', 'technology', 'furniture', 'breakroom'],
    alcohol: ['wine', 'beer', 'spirits', 'mixers', 'accessories', 'gift-sets'],
    convenience: ['snacks', 'beverages', 'essentials', 'tobacco', 'lottery', 'gas'],
    other: ['general', 'specialty', 'custom', 'imported', 'local', 'artisan']
  };

  useEffect(() => {
    if (!user || user.role !== 'business_owner') {
      navigate('/login');
      return;
    }

    // Pre-fill form with user data
    if (user.businessProfile?.businessType) {
      setFormData(prev => ({
        ...prev,
        businessType: user.businessProfile.businessType,
        contact: {
          ...prev.contact,
          phone: user.phone || '',
          email: user.email || ''
        }
      }));
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleArrayChange = (parent, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: prev[parent].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (formData.category.length === 0) newErrors.category = 'At least one category is required';
    
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
    
    if (!formData.contact.phone.trim()) newErrors['contact.phone'] = 'Phone number is required';
    if (!formData.contact.email.trim()) newErrors['contact.email'] = 'Email is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const businessData = {
        ...formData,
        category: formData.category
      };

      const response = await businessDashboardService.createBusiness(businessData);
      
      if (response.success) {
        toast.success('Business created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Failed to create business');
      }
    } catch (error) {
      console.error('Business creation error:', error);
      toast.error(error.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (formData.category.length === 0) newErrors.category = 'At least one category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.contact.phone.trim()) newErrors['contact.phone'] = 'Phone number is required';
    if (!formData.contact.email.trim()) newErrors['contact.email'] = 'Email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Basic Business Information</h3>
      
      <Input
        type="text"
        name="name"
        label="Business Name"
        placeholder="Enter your business name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        leftIcon={<Store className="h-5 w-5" />}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Business Type</label>
        <div className="grid grid-cols-2 gap-3">
          {businessTypes.map((type) => (
            <label key={type.value} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.businessType === type.value ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
            }`}>
              <input
                type="radio"
                name="businessType"
                value={type.value}
                checked={formData.businessType === type.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="text-2xl">{type.icon}</span>
              <span className="font-medium text-sm">{type.label}</span>
            </label>
          ))}
        </div>
        {errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
        <div className="grid grid-cols-3 gap-2">
          {formData.businessType && categories[formData.businessType]?.map((category) => (
            <label key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.category.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
        <textarea
          name="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Describe your business, what you offer, and what makes you unique..."
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Business Address</h3>
      
      <Input
        type="text"
        name="address.street"
        label="Street Address"
        placeholder="Enter street address"
        value={formData.address.street}
        onChange={handleChange}
        error={errors['address.street']}
        leftIcon={<MapPin className="h-5 w-5" />}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="text"
          name="address.city"
          label="City"
          placeholder="City"
          value={formData.address.city}
          onChange={handleChange}
          error={errors['address.city']}
        />
        <Input
          type="text"
          name="address.state"
          label="State/Province"
          placeholder="State"
          value={formData.address.state}
          onChange={handleChange}
          error={errors['address.state']}
        />
        <Input
          type="text"
          name="address.zipCode"
          label="ZIP Code"
          placeholder="ZIP Code"
          value={formData.address.zipCode}
          onChange={handleChange}
          error={errors['address.zipCode']}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
        <div className="space-y-3">
          {formData.operatingHours.map((day, index) => (
            <div key={day.day} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-24">
                <span className="text-sm font-medium capitalize">{day.day}</span>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => handleArrayChange('operatingHours', index, 'isOpen', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">Open</span>
              </label>
              {day.isOpen && (
                <>
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) => handleArrayChange('operatingHours', index, 'openTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => handleArrayChange('operatingHours', index, 'closeTime', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
      
      <Input
        type="tel"
        name="contact.phone"
        label="Phone Number"
        placeholder="+251 9X XXX XXXX"
        value={formData.contact.phone}
        onChange={handleChange}
        error={errors['contact.phone']}
        leftIcon={<Phone className="h-5 w-5" />}
      />

      <Input
        type="email"
        name="contact.email"
        label="Email Address"
        placeholder="business@example.com"
        value={formData.contact.email}
        onChange={handleChange}
        error={errors['contact.email']}
        leftIcon={<Mail className="h-5 w-5" />}
      />

      <Input
        type="url"
        name="contact.website"
        label="Website (Optional)"
        placeholder="https://yourbusiness.com"
        value={formData.contact.website}
        onChange={handleChange}
        leftIcon={<Globe className="h-5 w-5" />}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Settings</label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            name="deliveryInfo.deliveryRadius"
            label="Delivery Radius (km)"
            placeholder="5"
            value={formData.deliveryInfo.deliveryRadius}
            onChange={handleChange}
            min="1"
            max="50"
          />
          <Input
            type="number"
            name="deliveryInfo.minimumOrder"
            label="Minimum Order (ETB)"
            placeholder="50"
            value={formData.deliveryInfo.minimumOrder}
            onChange={handleChange}
            min="0"
          />
          <Input
            type="number"
            name="deliveryInfo.deliveryFee"
            label="Delivery Fee (ETB)"
            placeholder="20"
            value={formData.deliveryInfo.deliveryFee}
            onChange={handleChange}
            min="0"
          />
          <Input
            type="number"
            name="deliveryInfo.freeDeliveryThreshold"
            label="Free Delivery Threshold (ETB)"
            placeholder="200"
            value={formData.deliveryInfo.freeDeliveryThreshold}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Review & Complete</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="font-medium">Business Information</span>
        </div>
        <div className="ml-9 space-y-2">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Type:</strong> {businessTypes.find(t => t.value === formData.businessType)?.label}</p>
          <p><strong>Categories:</strong> {formData.category.join(', ')}</p>
          <p><strong>Description:</strong> {formData.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="font-medium">Address & Hours</span>
        </div>
        <div className="ml-9 space-y-2">
          <p><strong>Address:</strong> {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zipCode}</p>
          <p><strong>Operating Hours:</strong> {formData.operatingHours.filter(h => h.isOpen).length} days open</p>
        </div>

        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="font-medium">Contact & Delivery</span>
        </div>
        <div className="ml-9 space-y-2">
          <p><strong>Phone:</strong> {formData.contact.phone}</p>
          <p><strong>Email:</strong> {formData.contact.email}</p>
          <p><strong>Delivery Radius:</strong> {formData.deliveryInfo.deliveryRadius} km</p>
          <p><strong>Minimum Order:</strong> ETB {formData.deliveryInfo.minimumOrder}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Almost Done!</h4>
            <p className="text-sm text-blue-700 mt-1">
              After creating your business, you'll be able to add menu items, manage orders, and start accepting customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 ${
              step < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = [
    'Basic Information',
    'Address & Hours',
    'Contact & Delivery',
    'Review & Complete'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Business Setup</h1>
            <p className="text-gray-600">Set up your business profile to start accepting orders and managing your business.</p>
          </div>

          <Card>
            <Card.Content className="p-8">
              {renderStepIndicator()}
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Step {currentStep}: {stepTitles[currentStep - 1]}
                </h2>
                <p className="text-gray-600">
                  {currentStep === 1 && 'Tell us about your business and what you offer'}
                  {currentStep === 2 && 'Set your business location and operating hours'}
                  {currentStep === 3 && 'Configure contact details and delivery settings'}
                  {currentStep === 4 && 'Review your information and complete setup'}
                </p>
              </div>

              <div className="mb-8">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    loading={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Business
                  </Button>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BusinessSetup;
