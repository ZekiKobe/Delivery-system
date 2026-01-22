import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Eye,
  EyeOff,
  Check,
  Shield,
  Smartphone,
  Banknote,
  Star,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button, Card, Input } from '../ui';

const PaymentManager = ({ paymentMethods: initialMethods = [], onPaymentChange }) => {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods.length > 0 ? initialMethods : [
    {
      id: '1',
      type: 'card',
      cardType: 'visa',
      lastFour: '1234',
      expiryMonth: '12',
      expiryYear: '25',
      holderName: 'John Doe',
      isDefault: true,
      nickname: 'Personal Visa',
      isVerified: true,
      addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'mobile',
      provider: 'telebirr',
      phoneNumber: '+251912345678',
      isDefault: false,
      nickname: 'My TeleBirr',
      isVerified: true,
      addedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'card',
    // Card fields
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    cardType: '',
    // Mobile money fields
    provider: 'telebirr',
    phoneNumber: '',
    // Common fields
    nickname: ''
  });

  const [errors, setErrors] = useState({});

  const paymentTypes = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'mobile', label: 'Mobile Money', icon: Smartphone },
    { value: 'cash', label: 'Cash on Delivery', icon: Banknote }
  ];

  const mobileProviders = [
    { value: 'telebirr', label: 'TeleBirr', color: 'bg-blue-500' },
    { value: 'mpesa', label: 'M-Pesa', color: 'bg-green-500' },
    { value: 'abyssinia', label: 'Abyssinia Mobile Banking', color: 'bg-purple-500' },
    { value: 'cbe', label: 'CBE Birr', color: 'bg-yellow-500' }
  ];

  const cardTypes = ['visa', 'mastercard', 'amex'];

  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.match(/^4/)) return 'visa';
    if (cleaned.match(/^5[1-5]/)) return 'mastercard';
    if (cleaned.match(/^3[47]/)) return 'amex';
    return '';
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').slice(0, 19); // Max 16 digits + 3 spaces
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }

    if (formData.type === 'card') {
      if (!formData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!formData.expiryMonth) newErrors.expiryMonth = 'Expiry month is required';
      if (!formData.expiryYear) newErrors.expiryYear = 'Expiry year is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
      if (!formData.holderName.trim()) newErrors.holderName = 'Cardholder name is required';
      
      // Check if card is expired
      if (formData.expiryMonth && formData.expiryYear) {
        const currentDate = new Date();
        const cardDate = new Date(2000 + parseInt(formData.expiryYear), parseInt(formData.expiryMonth) - 1);
        if (cardDate < currentDate) {
          newErrors.expiryMonth = 'Card has expired';
        }
      }
    }

    if (formData.type === 'mobile') {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\+251[79]\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid Ethiopian mobile number';
      }
      if (!formData.provider) newErrors.provider = 'Provider is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      const cardType = detectCardType(formattedValue);
      setFormData(prev => ({ ...prev, cardNumber: formattedValue, cardType }));
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'phoneNumber') {
      // Auto-format Ethiopian phone numbers
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.startsWith('251')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('9') || cleaned.startsWith('7')) {
        cleaned = '+251' + cleaned;
      }
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMethod = {
      id: editingMethod ? editingMethod.id : Date.now().toString(),
      ...formData,
      isDefault: paymentMethods.length === 0,
      isVerified: false,
      addedDate: editingMethod ? editingMethod.addedDate : new Date().toISOString(),
      lastUsed: editingMethod ? editingMethod.lastUsed : null
    };

    // For cards, store only last 4 digits
    if (newMethod.type === 'card') {
      newMethod.lastFour = newMethod.cardNumber.replace(/\s/g, '').slice(-4);
      delete newMethod.cardNumber; // Don't store full card number
      delete newMethod.cvv; // Don't store CVV
    }

    if (editingMethod) {
      setPaymentMethods(prev => prev.map(method => 
        method.id === editingMethod.id ? { ...newMethod, isDefault: method.isDefault } : method
      ));
    } else {
      setPaymentMethods(prev => [...prev, newMethod]);
    }

    // Reset form
    resetForm();
    setIsSubmitting(false);
    
    onPaymentChange?.(paymentMethods);
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      cardType: '',
      provider: 'telebirr',
      phoneNumber: '',
      nickname: ''
    });
    setShowAddForm(false);
    setEditingMethod(null);
    setErrors({});
  };

  const handleEdit = (method) => {
    setFormData({
      type: method.type,
      cardNumber: method.type === 'card' ? `**** **** **** ${method.lastFour}` : '',
      expiryMonth: method.expiryMonth || '',
      expiryYear: method.expiryYear || '',
      cvv: '',
      holderName: method.holderName || '',
      cardType: method.cardType || '',
      provider: method.provider || 'telebirr',
      phoneNumber: method.phoneNumber || '',
      nickname: method.nickname || ''
    });
    setEditingMethod(method);
    setShowAddForm(true);
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(prev => {
        const remaining = prev.filter(method => method.id !== methodId);
        // If we deleted the default method, make the first remaining method default
        if (remaining.length > 0 && prev.find(method => method.id === methodId)?.isDefault) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
      onPaymentChange?.(paymentMethods);
    }
  };

  const handleSetDefault = (methodId) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
    onPaymentChange?.(paymentMethods);
  };

  const getCardIcon = (cardType) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳'
    };
    return icons[cardType] || '💳';
  };

  const getProviderIcon = (provider) => {
    const icons = {
      telebirr: '📱',
      mpesa: '📱',
      abyssinia: '🏦',
      cbe: '🏦'
    };
    return icons[provider] || '📱';
  };

  const formatLastUsed = (dateString) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage your payment options</p>
        </div>
        <Button 
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Payment Method
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-orange-200 bg-orange-50/30">
              <Card.Header>
                <div className="flex justify-between items-center">
                  <Card.Title>
                    {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                  </Card.Title>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                            className={`p-4 border rounded-lg text-center transition-all ${
                              formData.type === type.value
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto mb-2 ${
                              formData.type === type.value ? 'text-orange-600' : 'text-gray-600'
                            }`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Common Fields */}
                  <Input
                    label="Nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    error={errors.nickname}
                    placeholder="e.g., Personal Card, Work Account"
                    required
                  />

                  {/* Card-specific fields */}
                  {formData.type === 'card' && (
                    <>
                      <div className="relative">
                        <Input
                          label="Card Number"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          error={errors.cardNumber}
                          placeholder="1234 5678 9012 3456"
                          type={showCardNumber ? 'text' : 'password'}
                          required
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowCardNumber(!showCardNumber)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          }
                        />
                        {formData.cardType && (
                          <div className="absolute right-12 top-9 text-2xl">
                            {getCardIcon(formData.cardType)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Month
                          </label>
                          <select
                            name="expiryMonth"
                            value={formData.expiryMonth}
                            onChange={handleInputChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                              errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          {errors.expiryMonth && (
                            <p className="text-red-600 text-sm mt-1">{errors.expiryMonth}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Year
                          </label>
                          <select
                            name="expiryYear"
                            value={formData.expiryYear}
                            onChange={handleInputChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                              errors.expiryYear ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 20 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <option key={year} value={String(year).slice(-2)}>
                                  {year}
                                </option>
                              );
                            })}
                          </select>
                          {errors.expiryYear && (
                            <p className="text-red-600 text-sm mt-1">{errors.expiryYear}</p>
                          )}
                        </div>

                        <div className="relative">
                          <Input
                            label="CVV"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            error={errors.cvv}
                            placeholder="123"
                            type={showCVV ? 'text' : 'password'}
                            maxLength={4}
                            required
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowCVV(!showCVV)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />
                        </div>
                      </div>

                      <Input
                        label="Cardholder Name"
                        name="holderName"
                        value={formData.holderName}
                        onChange={handleInputChange}
                        error={errors.holderName}
                        placeholder="John Doe"
                        required
                      />
                    </>
                  )}

                  {/* Mobile Money fields */}
                  {formData.type === 'mobile' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Mobile Money Provider
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {mobileProviders.map(provider => (
                            <button
                              key={provider.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, provider: provider.value }))}
                              className={`p-3 border rounded-lg text-center transition-all ${
                                formData.provider === provider.value
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-8 h-8 ${provider.color} rounded-lg mx-auto mb-2`}></div>
                              <span className="text-sm font-medium">{provider.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Input
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        error={errors.phoneNumber}
                        placeholder="+251 9X XXX XXXX"
                        required
                      />
                    </>
                  )}

                  {/* Cash on Delivery info */}
                  {formData.type === 'cash' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-amber-800">
                        <Banknote className="h-5 w-5" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p className="text-amber-700 text-sm mt-2">
                        Pay with cash when your order arrives. Make sure to have exact change ready.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={isSubmitting}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      {editingMethod ? 'Update Method' : 'Save Payment Method'}
                    </Button>
                  </div>
                </form>
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <Card>
            <Card.Content className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h3>
              <p className="text-gray-600 mb-4">Add a payment method to start ordering</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Payment Method
              </Button>
            </Card.Content>
          </Card>
        ) : (
          paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${method.isDefault ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${method.isDefault ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        {method.type === 'card' && <CreditCard className={`h-5 w-5 ${method.isDefault ? 'text-orange-600' : 'text-gray-600'}`} />}
                        {method.type === 'mobile' && <Smartphone className={`h-5 w-5 ${method.isDefault ? 'text-orange-600' : 'text-gray-600'}`} />}
                        {method.type === 'cash' && <Banknote className={`h-5 w-5 ${method.isDefault ? 'text-orange-600' : 'text-gray-600'}`} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{method.nickname}</h4>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              Default
                            </span>
                          )}
                          {method.isVerified && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="text-gray-600 text-sm">
                          {method.type === 'card' && (
                            <>
                              <span className="capitalize">{method.cardType}</span> •••• {method.lastFour}
                              <span className="ml-2">• Expires {method.expiryMonth}/{method.expiryYear}</span>
                            </>
                          )}
                          {method.type === 'mobile' && (
                            <>
                              <span className="capitalize">{method.provider}</span> • {method.phoneNumber}
                            </>
                          )}
                          {method.type === 'cash' && (
                            <span>Cash on Delivery</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Last used {formatLastUsed(method.lastUsed)}</span>
                          </span>
                          <span>Added {formatLastUsed(method.addedDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(method.id)}
                          leftIcon={<Star className="h-3 w-3" />}
                        >
                          Set Default
                        </Button>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(method.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/30">
        <Card.Content className="p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Security & Privacy</span>
          </div>
          <p className="text-blue-700 text-sm mt-2">
            Your payment information is encrypted and securely stored. We never store your full card numbers or CVV codes.
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default PaymentManager;