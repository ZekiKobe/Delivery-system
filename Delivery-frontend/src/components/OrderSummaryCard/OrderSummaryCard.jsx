import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  MapPin, 
  Tag, 
  Gift,
  AlertCircle,
  Check,
  Percent
} from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { formatCurrency } from '../../utils';

const OrderSummaryCard = ({ 
  cart, 
  onQuantityChange, 
  onRemoveItem,
  pricing = {},
  deliveryInfo = {},
  promoCode = '',
  onPromoCodeChange,
  onApplyPromo,
  promoDiscount = 0,
  estimatedTime = '',
  isLoading = false,
  showPromoCode = true,
  compact = false
}) => {
  const [promoInput, setPromoInput] = useState(promoCode);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const {
    subtotal = 0,
    deliveryFee = 0,
    serviceFee = 0,
    tax = 0,
    total = 0
  } = pricing;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      await onApplyPromo?.(promoInput);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const renderOrderItem = (item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center space-x-3 sm:space-x-4 py-3 border-b border-gray-100 last:border-b-0"
    >
      {/* Item Image/Icon */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-gray-700 text-center px-1 font-medium">
          {item.name.substring(0, 3)}
        </span>
      </div>
      
      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{item.name}</h4>
        <p className="text-xs sm:text-sm text-gray-600 truncate">{item.restaurant?.name}</p>
        <p className="text-orange-600 font-semibold text-sm sm:text-base">{formatCurrency(item.price)}</p>
        
        {/* Item Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.customizations.map((custom, idx) => (
              <span key={idx} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {custom}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Quantity Controls */}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuantityChange?.(item.id, item.quantity - 1)}
            disabled={isLoading}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            <Minus className="h-2 w-2 sm:h-3 sm:w-3" />
          </Button>
          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
            disabled={isLoading}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveItem?.(item.id)}
          disabled={isLoading}
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
        </Button>
      </div>
    </motion.div>
  );

  const renderPricingBreakdown = () => (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal ({cart.length} items)</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      
      {/* Delivery Fee */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-1">
          <span className="text-gray-600">Delivery Fee</span>
          {deliveryFee === 0 && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">FREE</span>
          )}
        </div>
        <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
          {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
        </span>
      </div>
      
      {/* Service Fee */}
      {serviceFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium">{formatCurrency(serviceFee)}</span>
        </div>
      )}
      
      {/* Tax */}
      {tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
      )}
      
      {/* Promo Discount */}
      {promoDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Promo Discount</span>
          </div>
          <span className="font-medium text-green-600">-{formatCurrency(promoDiscount)}</span>
        </div>
      )}
      
      {/* Total */}
      <div className="flex justify-between text-lg font-semibold border-t pt-3">
        <span>Total</span>
        <span className="text-orange-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );

  const renderPromoCodeSection = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Promo Code</span>
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="flex-1"
          disabled={isApplyingPromo}
        />
        <Button
          variant="outline"
          onClick={handleApplyPromo}
          disabled={!promoInput.trim() || isApplyingPromo}
          className="px-4"
        >
          {isApplyingPromo ? (
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      
      {/* Available Promo Codes */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Available offers:</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Percent className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 font-medium">FIRST10</span>
              <span className="text-gray-600">- 10% off first order</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPromoInput('FIRST10')}
              className="h-6 text-xs px-2"
            >
              Apply
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Gift className="h-3 w-3 text-purple-500" />
              <span className="text-purple-600 font-medium">FREEDEL</span>
              <span className="text-gray-600">- Free delivery</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPromoInput('FREEDEL')}
              className="h-6 text-xs px-2"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <Card>
        <Card.Content className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{cart.length} items</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(total)}</span>
            </div>
            
            {estimatedTime && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated delivery: {estimatedTime}</span>
              </div>
            )}
            
            {renderPricingBreakdown()}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-sm font-normal text-gray-600">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-2">
            {cart.map((item, index) => renderOrderItem(item, index))}
          </div>
          
          {/* Promo Code Section */}
          {showPromoCode && (
            <div className="border-t pt-4">
              {renderPromoCodeSection()}
            </div>
          )}
          
          {/* Pricing Breakdown */}
          <div className="border-t pt-4">
            {renderPricingBreakdown()}
          </div>
          
          {/* Estimated Delivery Time */}
          {estimatedTime && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Estimated delivery: {estimatedTime}</span>
              </div>
            </div>
          )}
          
          {/* Delivery Address */}
          {deliveryInfo.address && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Delivery to:</p>
                  <p className="text-gray-600">{deliveryInfo.address}</p>
                  {deliveryInfo.instructions && (
                    <p className="text-gray-500 text-xs mt-1">
                      Note: {deliveryInfo.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Savings Alert */}
          {promoDiscount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  You're saving {formatCurrency(promoDiscount)} on this order!
                </span>
              </div>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default OrderSummaryCard;