import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Clock, 
  MapPin, 
  Truck,
  ArrowRight,
  Gift,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency } from '../../utils';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock cart data - in real app this would come from cart context/state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      restaurantId: 'rest1',
      restaurantName: 'Traditional Ethiopian',
      name: 'Doro Wot',
      description: 'Traditional Ethiopian chicken stew with berbere spice',
      price: 180,
      quantity: 2,
      image: '/api/placeholder/80/80',
      customizations: ['Extra Spicy', 'No Onions'],
      maxQuantity: 10
    },
    {
      id: 2,
      restaurantId: 'rest1',
      restaurantName: 'Traditional Ethiopian',
      name: 'Injera',
      description: 'Traditional sourdough flatbread',
      price: 45,
      quantity: 3,
      image: '/api/placeholder/80/80',
      customizations: [],
      maxQuantity: 15
    },
    {
      id: 3,
      restaurantId: 'rest2',
      restaurantName: 'Pizza Palace',
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, and basil',
      price: 280,
      quantity: 1,
      image: '/api/placeholder/80/80',
      customizations: ['Large Size', 'Extra Cheese'],
      maxQuantity: 5
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, Addis Ababa');
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Mock promo codes
  const promoCodes = {
    'WELCOME10': { discount: 10, type: 'percentage', description: '10% off your order' },
    'SAVE50': { discount: 50, type: 'fixed', description: 'ETB 50 off your order' },
    'FREESHIP': { discount: 0, type: 'shipping', description: 'Free delivery' }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const applyPromoCode = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
      setShowPromoInput(false);
      setPromoCode('');
    } else {
      // Show error - invalid promo code
      setAppliedPromo({ error: 'Invalid promo code' });
      setTimeout(() => setAppliedPromo(null), 3000);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = appliedPromo?.type === 'shipping' ? 0 : 25;
  const serviceFee = Math.round(subtotal * 0.02); // 2% service fee
  
  let discount = 0;
  if (appliedPromo && !appliedPromo.error) {
    if (appliedPromo.type === 'percentage') {
      discount = Math.round(subtotal * (appliedPromo.discount / 100));
    } else if (appliedPromo.type === 'fixed') {
      discount = appliedPromo.discount;
    }
  }
  
  const total = subtotal + deliveryFee + serviceFee - discount;

  // Group items by restaurant
  const itemsByRestaurant = cartItems.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        name: item.restaurantName,
        items: []
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {});

  const isEmpty = cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {isEmpty ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
            </p>
          </div>

          {isEmpty ? (
            /* Empty Cart State */
            <Card>
              <Card.Content className="p-12 text-center">
                <ShoppingCart className="h-20 w-20 mx-auto text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-8">
                  Looks like you haven't added any items to your cart yet. Start browsing restaurants to find delicious food!
                </p>
                <Button 
                  onClick={() => navigate('/restaurants')}
                  leftIcon={<ArrowRight className="h-5 w-5" />}
                  size="lg"
                >
                  Browse Restaurants
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <Card>
                  <Card.Header>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <Card.Title>Delivery Address</Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{deliveryAddress}</p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Estimated delivery: 25-35 min
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                  </Card.Content>
                </Card>

                {/* Cart Items by Restaurant */}
                {Object.entries(itemsByRestaurant).map(([restaurantId, restaurant]) => (
                  <Card key={restaurantId}>
                    <Card.Header>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {restaurant.name.substring(0, 2)}
                          </span>
                        </div>
                        <Card.Title>{restaurant.name}</Card.Title>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <div className="space-y-4">
                        {restaurant.items.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {/* Item Image */}
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold">
                                {item.name.substring(0, 2)}
                              </span>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              
                              {item.customizations.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500">Customizations:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.customizations.map((customization, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                      >
                                        {customization}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-3">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-8 h-8 rounded-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= item.maxQuantity}
                                      className="w-8 h-8 rounded-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Remove Button */}
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <p className="font-semibold text-lg text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-sm text-gray-600">
                                      {formatCurrency(item.price)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </Card.Content>
                  </Card>
                ))}

                {/* Promo Code Section */}
                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-gray-900">Promo Code</span>
                      </div>
                      {!appliedPromo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPromoInput(!showPromoInput)}
                        >
                          Add Code
                        </Button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showPromoInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter promo code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                              className="flex-1"
                            />
                            <Button 
                              onClick={applyPromoCode}
                              disabled={!promoCode.trim()}
                            >
                              Apply
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {appliedPromo && !appliedPromo.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{appliedPromo.code}</p>
                            <p className="text-sm text-green-700">{appliedPromo.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={removePromoCode}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </motion.div>
                    )}

                    {appliedPromo?.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800">{appliedPromo.error}</p>
                      </motion.div>
                    )}
                  </Card.Content>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <Card.Header>
                    <Card.Title>Order Summary</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">{formatCurrency(serviceFee)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          Delivery Fee
                        </span>
                        <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                          {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedPromo.code})</span>
                          <span className="font-medium">-{formatCurrency(discount)}</span>
                        </div>
                      )}

                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button 
                        className="w-full"
                        size="lg"
                        onClick={() => navigate('/checkout')}
                        rightIcon={<ArrowRight className="h-5 w-5" />}
                      >
                        Proceed to Checkout
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/restaurants')}
                      >
                        Continue Shopping
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Gift className="h-5 w-5" />
                        <span className="font-medium">Free delivery on orders over ETB 500</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Add {formatCurrency(500 - subtotal)} more to qualify for free delivery!
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;