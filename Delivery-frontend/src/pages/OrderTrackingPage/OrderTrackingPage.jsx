import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { 
  Package, 
  Clock, 
  Phone, 
  MessageCircle, 
  MapPin, 
  CheckCircle,
  User,
  Star,
  Navigation,
  AlertTriangle,
  Loader
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Button, Card } from '../../components/ui';
import DeliveryPersonCard from '../../components/DeliveryPersonCard/DeliveryPersonCard';
import OrderStatusTracker from '../../components/OrderStatusTracker/OrderStatusTracker';
import { useOrder, useNotification } from '../../context';
import { formatCurrency, formatRelativeTime, calculateDistance } from '../../utils';
import { orderService, socketService } from '../../services';
import toast from 'react-hot-toast';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OrderTrackingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeOrder, updateDeliveryLocation, updateOrderStatus, getDeliveryETA, addOrderNote } = useOrder();
  const { notifyOrderUpdate, notifyDeliveryUpdate, showSuccess, showInfo } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  
  // Get order ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('order');

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        // If no order ID, try to use active order or redirect
        if (activeOrder) {
          setOrderData(activeOrder);
          setLoading(false);
        } else {
          toast.error('No order found to track');
          navigate('/orders');
        }
        return;
      }

      try {
        setLoading(true);
        const response = await orderService.getOrder(orderId);
        
        if (response.success) {
          setOrderData(response.data.order);
        } else {
          toast.error('Order not found');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, activeOrder, navigate]);

  // Set up real-time order tracking
  useEffect(() => {
    if (!orderData?._id) return;

    const handleOrderUpdate = (data) => {
      if (data.orderId === orderData._id) {
        setOrderData(prev => ({ ...prev, ...data.updates }));
        
        // Show notifications for status changes
        if (data.updates.status) {
          const statusMessages = {
            'confirmed': 'Your order has been confirmed!',
            'preparing': 'Restaurant is preparing your order',
            'ready': 'Your order is ready for pickup',
            'picked-up': 'Your order has been picked up for delivery',
            'out-for-delivery': 'Your order is out for delivery',
            'delivered': 'Your order has been delivered! Enjoy!',
            'cancelled': 'Your order has been cancelled'
          };
          
          const message = statusMessages[data.updates.status] || 'Order status updated';
          toast.success(message);
        }
      }
    };

    const handleLocationUpdate = (data) => {
      if (data.orderId === orderData._id && data.location) {
        setOrderData(prev => ({
          ...prev,
          deliveryPerson: {
            ...prev.deliveryPerson,
            currentLocation: data.location,
            lastLocationUpdate: new Date().toISOString()
          }
        }));
      }
    };

    // Subscribe to real-time updates
    socketService.joinOrderRoom(orderData._id);
    socketService.onOrderUpdate(handleOrderUpdate);
    socketService.onLocationUpdate(handleLocationUpdate);

    return () => {
      socketService.leaveOrderRoom(orderData._id);
      socketService.offOrderUpdate(handleOrderUpdate);
      socketService.offLocationUpdate(handleLocationUpdate);
    };
  }, [orderData?._id]);
  
  const currentOrder = orderData;

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  // Handle no order found
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-32">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/orders')}>View Your Orders</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle delivery person interactions
  const handleCall = (phoneNumber) => {
    toast.success(`Calling ${phoneNumber}...`);
    // In a real app, this would initiate a phone call
  };

  const handleMessage = (deliveryPersonId) => {
    toast.success('Opening chat with delivery person...');
    // In a real app, this would open a chat interface
  };

  const handleAddNote = () => {
    if (deliveryNotes.trim()) {
      addOrderNote(deliveryNotes, 'customer');
      setDeliveryNotes('');
      showInfo(
        'Your delivery instructions have been sent to the delivery person.',
        'Note Added'
      );
    }
  };

  const polylinePositions = [
    [currentOrder.restaurant.coordinates.lat, currentOrder.restaurant.coordinates.lng],
    [currentOrder.deliveryPerson.currentLocation.lat, currentOrder.deliveryPerson.currentLocation.lng],
    [currentOrder.deliveryAddress.coordinates.lat, currentOrder.deliveryAddress.coordinates.lng]
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Track Your Order
                </h1>
                <p className="text-gray-600">
                  Order #{currentOrder.orderNumber} • {currentOrder.restaurant.name}
                </p>
              </div>
              
              {realTimeEnabled && currentOrder.status === 'on_the_way' && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 font-medium">Live tracking</span>
                </div>
              )}
            </div>
            
            {/* Quick Status Overview with Enhanced Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Estimated Arrival</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {currentOrder.estimatedDeliveryTime ? formatRelativeTime(currentOrder.estimatedDeliveryTime) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Distance Remaining</p>
                    <p className="font-semibold text-gray-900">
                      {currentOrder.deliveryPerson?.currentLocation && currentOrder.deliveryAddress?.coordinates
                        ? `${Math.round(calculateDistance(
                            currentOrder.deliveryPerson.currentLocation.lat,
                            currentOrder.deliveryPerson.currentLocation.lng,
                            currentOrder.deliveryAddress.coordinates.lat,
                            currentOrder.deliveryAddress.coordinates.lng
                          ) * 10) / 10} km`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900 capitalize truncate">
                      {currentOrder.status?.replace('-', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Delivery Partner</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {currentOrder.deliveryPerson?.firstName || 'N/A'} {currentOrder.deliveryPerson?.lastName || ''}
                    </p>
                  </div>
                </div>
              </div>

              {currentOrder.preferredVehicleType && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Preferred Vehicle</p>
                      <p className="font-semibold text-gray-900 capitalize truncate">
                        {currentOrder.preferredVehicleType}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Order Details */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6 order-2 lg:order-1">
              {/* Enhanced Order Status Tracker */}
              <OrderStatusTracker 
                order={currentOrder}
                showEstimatedTimes={true}
                animated={true}
              />

              {/* Enhanced Delivery Person Card */}
              {currentOrder.status === 'on_the_way' && currentOrder.deliveryPerson && (
                <DeliveryPersonCard
                  deliveryPerson={currentOrder.deliveryPerson}
                  estimatedArrival={currentOrder.estimatedDeliveryTime ? new Date(currentOrder.estimatedDeliveryTime) : null}
                  distance={
                    currentOrder.deliveryPerson?.currentLocation && currentOrder.deliveryAddress?.coordinates
                      ? calculateDistance(
                          currentOrder.deliveryPerson.currentLocation.lat,
                          currentOrder.deliveryPerson.currentLocation.lng,
                          currentOrder.deliveryAddress.coordinates.lat,
                          currentOrder.deliveryAddress.coordinates.lng
                        )
                      : 0
                  }
                  onCall={handleCall}
                  onMessage={handleMessage}
                  showLocation={true}
                  compact={window.innerWidth < 1024} // Use compact view on mobile
                />
              )}

              {/* Real-time Tracking Control */}
              <Card>
                <Card.Header>
                  <Card.Title>Live Tracking</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Real-time Updates</span>
                      <button
                        onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          realTimeEnabled ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {realTimeEnabled && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Live tracking active</span>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Add Delivery Notes */}
              <Card>
                <Card.Header>
                  <Card.Title>Delivery Instructions</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Add special instructions for delivery..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <Button 
                      onClick={handleAddNote} 
                      disabled={!deliveryNotes.trim()}
                      size="sm"
                      className="w-full"
                    >
                      Add Note
                    </Button>
                  </div>
                </Card.Content>
              </Card>

              {/* Enhanced Order Items */}
              <Card>
                <Card.Header>
                  <Card.Title>Order Summary</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {/* Restaurant Info */}
                    <div className="pb-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{currentOrder.restaurant.name}</p>
                      <p className="text-sm text-gray-600">{currentOrder.restaurant.address}</p>
                    </div>
                    
                    {/* Order Items */}
                    <div className="space-y-3">
                      {currentOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(currentOrder.pricing?.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(currentOrder.pricing?.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Service Fee</span>
                        <span>{formatCurrency(currentOrder.pricing?.serviceFee)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Tax</span>
                        <span>{formatCurrency(currentOrder.pricing?.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-orange-600">{formatCurrency(currentOrder.pricing?.total)}</span>
                      </div>
                    </div>
                    
                    {/* Delivery Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium">
                          {currentOrder.deliveryPerson?.currentLocation && currentOrder.deliveryAddress?.coordinates
                            ? `${Math.round(calculateDistance(
                                currentOrder.deliveryPerson.currentLocation.lat,
                                currentOrder.deliveryPerson.currentLocation.lng,
                                currentOrder.deliveryAddress.coordinates.lat,
                                currentOrder.deliveryAddress.coordinates.lng
                              ) * 10) / 10} km`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium font-mono">{currentOrder.orderNumber}</span>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="h-full">
                <Card.Header>
                  <Card.Title>Live Tracking</Card.Title>
                </Card.Header>
                <Card.Content className="p-0">
                  <div className="h-64 sm:h-80 lg:h-96 xl:h-full rounded-lg overflow-hidden">
                    {currentOrder.deliveryPerson?.currentLocation && currentOrder.deliveryAddress?.coordinates && (
                      <MapContainer
                        center={[currentOrder.deliveryPerson.currentLocation.lat, currentOrder.deliveryPerson.currentLocation.lng]}
                        zoom={14}
                        className="h-full w-full"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        {/* Restaurant Marker */}
                        <Marker 
                          position={[currentOrder.restaurant.coordinates.lat, currentOrder.restaurant.coordinates.lng]}
                          icon={restaurantIcon}
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">{currentOrder.restaurant.name}</p>
                              <p className="text-sm text-gray-600">Restaurant</p>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Delivery Person Marker */}
                        <Marker 
                          position={[currentOrder.deliveryPerson.currentLocation.lat, currentOrder.deliveryPerson.currentLocation.lng]}
                          icon={deliveryIcon}
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">{currentOrder.deliveryPerson.firstName} {currentOrder.deliveryPerson.lastName}</p>
                              <p className="text-sm text-gray-600">Delivery Person</p>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Destination Marker */}
                        <Marker position={[currentOrder.deliveryAddress.coordinates.lat, currentOrder.deliveryAddress.coordinates.lng]}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">Delivery Address</p>
                              <p className="text-sm text-gray-600">{currentOrder.deliveryAddress.street}</p>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Route Line */}
                        <Polyline 
                          positions={polylinePositions}
                          color="#f97316"
                          weight={4}
                          opacity={0.8}
                          dashArray="10, 10"
                        />
                      </MapContainer>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;