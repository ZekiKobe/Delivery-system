import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Clock, 
  User, 
  Phone, 
  Edit3,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Shield,
  Gift
} from 'lucide-react';
import { useOrder, useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import PaymentMethodSelector from '../../components/PaymentMethodSelector/PaymentMethodSelector';
import OrderSummaryCard from '../../components/OrderSummaryCard/OrderSummaryCard';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency } from '../../utils';
import { orderService, paymentService } from '../../services';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart, createOrder } = useOrder();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentErrors, setPaymentErrors] = useState({});

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || 'Addis Ababa',
    area: user?.addresses?.[0]?.area || '',
    instructions: ''
  });

  const [preferredVehicleType, setPreferredVehicleType] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  
  const [mobileInfo, setMobileInfo] = useState({
    provider: '',
    phone: ''
  });

  const deliveryFee = 15;
  const serviceFee = 5;
  const taxRate = 0.15; // 15% tax
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * taxRate);
  const discountedSubtotal = subtotal - promoDiscount;
  const total = discountedSubtotal + deliveryFee + serviceFee + tax;

  const estimatedTime = '25-35 min';

  // Promo codes
  const promoCodes = {
    'FIRST10': { type: 'percentage', value: 10, description: '10% off first order' },
    'FREEDEL': { type: 'delivery', value: deliveryFee, description: 'Free delivery' },
    'SAVE50': { type: 'fixed', value: 50, description: '50 ETB off' }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleApplyPromo = async (code) => {
    const upperCode = code.toUpperCase();
    
    if (!promoCodes[upperCode]) {
      toast.error('Invalid promo code');
      return;
    }
    
    const promo = promoCodes[upperCode];
    let discount = 0;
    
    switch (promo.type) {
      case 'percentage':
        discount = Math.round(subtotal * (promo.value / 100));
        break;
      case 'fixed':
        discount = Math.min(promo.value, subtotal);
        break;
      case 'delivery':
        discount = deliveryFee;
        break;
      default:
        discount = 0;
    }
    
    setPromoCode(upperCode);
    setPromoDiscount(discount);
    toast.success(`Promo code applied! You saved ${formatCurrency(discount)}`);
  };

  const validatePaymentInfo = () => {
    const errors = {};
    
    if (paymentMethod === 'card') {
      if (!cardInfo.number || cardInfo.number.replace(/\s/g, '').length < 13) {
        errors.cardNumber = 'Please enter a valid card number';
      }
      if (!cardInfo.expiry || !/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
        errors.cardExpiry = 'Please enter expiry as MM/YY';
      }
      if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
        errors.cardCvv = 'Please enter a valid CVV';
      }
      if (!cardInfo.name || cardInfo.name.trim().length < 2) {
        errors.cardName = 'Please enter the cardholder name';
      }
    }
    
    if (paymentMethod === 'mobile') {
      if (!mobileInfo.provider) {
        errors.mobileProvider = 'Please select a mobile money provider';
      }
      if (!mobileInfo.phone) {
        errors.mobilePhone = 'Please enter your phone number';
      }
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Validate payment information
    if (!validatePaymentInfo()) {
      toast.error('Please check your payment information');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || ''
        })),
        restaurant: cart[0]?.restaurant?.id,
        deliveryAddress: {
          street: deliveryInfo.address,
          city: deliveryInfo.city,
          area: deliveryInfo.area,
          instructions: deliveryInfo.instructions
        },
        contactInfo: {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone
        },
        paymentMethod,
        totalAmount: total,
        promoCode: promoCode || undefined,
        preferredVehicleType: preferredVehicleType || undefined
      };

      // Create order
      const orderResponse = await orderService.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderId = orderResponse.data.order._id;

      // Process payment if needed
      if (paymentMethod === 'card') {
        const paymentData = {
          orderId,
          amount: total,
          cardInfo: {
            number: cardInfo.number.replace(/\s/g, ''),
            expiry: cardInfo.expiry,
            cvv: cardInfo.cvv,
            name: cardInfo.name
          }
        };

        const paymentResponse = await paymentService.processPayment(paymentData);
        
        if (!paymentResponse.success) {
          throw new Error(paymentResponse.message || 'Payment failed');
        }
        
        toast.success('💳 Payment confirmed! Your order is being prepared.');
      } else if (paymentMethod === 'mobile') {
        const mobilePaymentData = {
          orderId,
          amount: total,
          provider: mobileInfo.provider,
          phoneNumber: mobileInfo.phone
        };

        const paymentResponse = await paymentService.processMobilePayment(mobilePaymentData);
        
        if (!paymentResponse.success) {
          throw new Error(paymentResponse.message || 'Mobile payment failed');
        }
        
        toast.success('📱 Mobile payment request sent! Check your phone for confirmation.');
      } else {
        toast.success('💵 Cash on delivery confirmed! Have exact change ready.');
      }

      // Update local order context
      createOrder({
        ...orderData,
        _id: orderId,
        status: 'confirmed',
        estimatedTime,
        createdAt: new Date().toISOString()
      });
      
      clearCart();
      toast.success('🎉 Order placed successfully!');
      
      navigate(`/track?order=${orderId}`);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderSummary = () => (
    <OrderSummaryCard
      cart={cart}
      onQuantityChange={handleQuantityChange}
      onRemoveItem={removeFromCart}
      pricing={{
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        total
      }}
      deliveryInfo={deliveryInfo}
      promoCode={promoCode}
      onApplyPromo={handleApplyPromo}
      promoDiscount={promoDiscount}
      estimatedTime={estimatedTime}
      isLoading={loading}
      showPromoCode={true}
    />
  );

  const renderDeliveryForm = () => (
    <Card>
      <Card.Header>
        <Card.Title>Delivery Information</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input
                value={deliveryInfo.name}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <Input
                value={deliveryInfo.phone}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <Input
              value={deliveryInfo.address}
              onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
              placeholder="Enter your street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Input
                value={deliveryInfo.city}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                placeholder="Enter your city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <Input
                value={deliveryInfo.area}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, area: e.target.value})}
                placeholder="Enter your area"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={deliveryInfo.instructions}
              onChange={(e) => setDeliveryInfo({...deliveryInfo, instructions: e.target.value})}
              placeholder="Any special instructions for the delivery person..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Vehicle (Optional)
            </label>
            <select
              value={preferredVehicleType}
              onChange={(e) => setPreferredVehicleType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Any Vehicle</option>
              <option value="walking">Walking</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select your preferred delivery vehicle type. This helps match you with the right delivery person.
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  const renderPaymentForm = () => (
    <PaymentMethodSelector
      selectedMethod={paymentMethod}
      onMethodChange={setPaymentMethod}
      cardInfo={cardInfo}
      onCardInfoChange={setCardInfo}
      mobileInfo={mobileInfo}
      onMobileInfoChange={setMobileInfo}
      errors={paymentErrors}
      loading={loading}
    />
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {renderOrderSummary()}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/restaurants')}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Continue Shopping
              </Button>
              <Button onClick={() => setStep(2)}>
                Proceed to Delivery
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {renderDeliveryForm()}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Cart
              </Button>
              <Button onClick={() => setStep(3)}>
                Proceed to Payment
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {renderPaymentForm()}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Delivery
              </Button>
              <Button 
                onClick={handlePlaceOrder}
                disabled={loading}
                leftIcon={loading ? null : <CheckCircle className="h-4 w-4" />}
              >
                {loading ? 'Placing Order...' : `Place Order - ${formatCurrency(total)}`}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items to your cart to get started!</p>
            <Button onClick={() => navigate('/restaurants')}>
              Browse Restaurants
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order in just a few steps</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{stepNumber}</span>
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-0.5 ${
                      step > stepNumber ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                Review Order
              </span>
              <span className={step >= 2 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                Delivery Details
              </span>
              <span className={step >= 3 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                Payment
              </span>
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;