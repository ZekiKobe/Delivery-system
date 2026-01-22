import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { isValidEmail } from '../../utils';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodChange, 
  cardInfo, 
  onCardInfoChange,
  mobileInfo,
  onMobileInfoChange,
  errors = {},
  loading = false 
}) => {
  const [showCVV, setShowCVV] = useState(false);
  const [cardType, setCardType] = useState('');

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives at your doorstep',
      icon: Banknote,
      available: true,
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Secure payment with Visa, Mastercard, or Amex',
      icon: CreditCard,
      available: true,
      fee: 0,
      processingTime: 'Instant'
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'Pay with M-BIRR, HelloCash, or other mobile wallets',
      icon: Smartphone,
      available: true,
      fee: 5,
      processingTime: '1-2 minutes'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct transfer from your bank account',
      icon: Shield,
      available: false,
      fee: 10,
      processingTime: '5-10 minutes'
    }
  ];

  const detectCardType = (number) => {
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };

    const cleanNumber = number.replace(/\s/g, '');
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return type;
      }
    }
    return '';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    const type = detectCardType(formatted);
    setCardType(type);
    onCardInfoChange({ ...cardInfo, number: formatted });
  };

  const validateCardInfo = () => {
    const errors = {};
    
    if (!cardInfo.number || cardInfo.number.replace(/\s/g, '').length < 13) {
      errors.number = 'Please enter a valid card number';
    }
    
    if (!cardInfo.expiry || !/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
      errors.expiry = 'Please enter expiry as MM/YY';
    }
    
    if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardInfo.name || cardInfo.name.trim().length < 2) {
      errors.name = 'Please enter the cardholder name';
    }
    
    return errors;
  };

  const renderPaymentMethodCard = (method) => {
    const Icon = method.icon;
    const isSelected = selectedMethod === method.id;
    
    return (
      <motion.div
        key={method.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-orange-500 bg-orange-50 shadow-md' 
            : method.available 
              ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm' 
              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
        }`}
        onClick={() => method.available && onMethodChange(method.id)}
        whileHover={method.available ? { scale: 1.02 } : {}}
        whileTap={method.available ? { scale: 0.98 } : {}}
      >
        {/* Selection Indicator */}
        <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${
          isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
        }`}>
          {isSelected && (
            <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>

        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-lg ${
            isSelected ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
              isSelected ? 'text-orange-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{method.name}</h3>
              <div className="flex flex-wrap gap-1">
                {!method.available && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
                {method.fee > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    +{method.fee} ETB fee
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{method.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs text-gray-500 space-y-1 sm:space-y-0">
              <span>Processing: {method.processingTime}</span>
              {method.available && (
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCardForm = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 space-y-4 border-t pt-6"
    >
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Lock className="h-4 w-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="relative">
          <Input
            value={cardInfo.number}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={errors.number ? 'border-red-500' : ''}
          />
          {cardType && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {cardType}
              </span>
            </div>
          )}
        </div>
        {errors.number && (
          <p className="mt-1 text-sm text-red-600">{errors.number}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <Input
            value={cardInfo.expiry}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
              }
              onCardInfoChange({ ...cardInfo, expiry: value });
            }}
            placeholder="MM/YY"
            maxLength={5}
            className={errors.expiry ? 'border-red-500' : ''}
          />
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
          )}
        </div>
        
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <div className="relative">
            <Input
              type={showCVV ? 'text' : 'password'}
              value={cardInfo.cvv}
              onChange={(e) => onCardInfoChange({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '') })}
              placeholder="123"
              maxLength={4}
              className={errors.cvv ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowCVV(!showCVV)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
        
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name on Card
          </label>
          <Input
            value={cardInfo.name}
            onChange={(e) => onCardInfoChange({ ...cardInfo, name: e.target.value })}
            placeholder="John Doe"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-green-500 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-medium">Your payment is secured by 256-bit SSL encryption</p>
            <p>We don't store your card details on our servers</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMobileMoneyForm = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 space-y-4 border-t pt-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Money Provider
        </label>
        <select 
          value={mobileInfo.provider}
          onChange={(e) => onMobileInfoChange({ ...mobileInfo, provider: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Select provider</option>
          <option value="mbirr">M-BIRR</option>
          <option value="hellocash">HelloCash</option>
          <option value="ebirr">eBIRR</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <Input
          value={mobileInfo.phone}
          onChange={(e) => onMobileInfoChange({ ...mobileInfo, phone: e.target.value })}
          placeholder="+251 91 234 5678"
        />
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Mobile Money Instructions</p>
            <p>You'll receive a payment request on your phone. Please approve it to complete the payment.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title>Payment Method</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {paymentMethods.map(method => renderPaymentMethodCard(method))}
          
          <AnimatePresence>
            {selectedMethod === 'card' && renderCardForm()}
            {selectedMethod === 'mobile' && renderMobileMoneyForm()}
          </AnimatePresence>
        </div>
      </Card.Content>
    </Card>
  );
};

export default PaymentMethodSelector;