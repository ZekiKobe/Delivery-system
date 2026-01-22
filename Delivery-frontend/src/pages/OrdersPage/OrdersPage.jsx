import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Star, 
  Filter, 
  Search,
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  RotateCcw,
  Eye,
  Download,
  Loader
} from 'lucide-react';
import { useAuth, useOrder } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency, formatRelativeTime } from '../../utils';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { user } = useAuth();
  const { orders, fetchUserOrders, loading: contextLoading } = useOrder();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use the context method to fetch orders
        await fetchUserOrders();
        
        // Also fetch directly to ensure we have the latest data
        const response = await orderService.getUserOrders();
        
        if (response.success) {
          setOrderHistory(response.data.orders || []);
        } else {
          setError('Failed to load orders');
          toast.error('Failed to load orders');
        }
      } catch (err) {
        setError('Failed to load orders');
        toast.error('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filterOptions = [
    { id: 'all', label: 'All Orders', count: orderHistory.length },
    { id: 'delivered', label: 'Delivered', count: orderHistory.filter(o => o.status === 'delivered').length },
    { id: 'active', label: 'Active', count: orderHistory.filter(o => ['preparing', 'ready', 'assigned', 'picked_up', 'on_the_way'].includes(o.status)).length },
    { id: 'cancelled', label: 'Cancelled', count: orderHistory.filter(o => o.status === 'cancelled').length }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        icon: Clock, 
        color: 'text-yellow-600 bg-yellow-100',
        text: 'Pending'
      },
      'confirmed': { 
        icon: CheckCircle, 
        color: 'text-blue-600 bg-blue-100',
        text: 'Confirmed'
      },
      'preparing': { 
        icon: Clock, 
        color: 'text-yellow-600 bg-yellow-100',
        text: 'Preparing'
      },
      'ready': { 
        icon: CheckCircle, 
        color: 'text-purple-600 bg-purple-100',
        text: 'Ready'
      },
      'assigned': { 
        icon: Truck, 
        color: 'text-indigo-600 bg-indigo-100',
        text: 'Assigned'
      },
      'picked_up': { 
        icon: Truck, 
        color: 'text-blue-600 bg-blue-100',
        text: 'Picked Up'
      },
      'on_the_way': { 
        icon: Truck, 
        color: 'text-blue-600 bg-blue-100',
        text: 'On the Way'
      },
      'delivered': { 
        icon: CheckCircle, 
        color: 'text-green-600 bg-green-100',
        text: 'Delivered'
      },
      'cancelled': { 
        icon: XCircle, 
        color: 'text-red-600 bg-red-100',
        text: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredOrders = orderHistory.filter(order => {
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'active' && ['preparing', 'ready', 'assigned', 'picked_up', 'on_the_way'].includes(order.status)) ||
                         order.status === activeFilter;
    const matchesSearch = order.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const OrderDetailModal = ({ order, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>

          {/* Order Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              {React.createElement(getStatusConfig(order.status).icon, {
                className: `h-6 w-6 ${getStatusConfig(order.status).color.split(' ')[0]}`
              })}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(order.status).color}`}>
                {getStatusConfig(order.status).text}
              </span>
            </div>
            
            {order.status === 'on_the_way' && order.estimatedDeliveryTime && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                </p>
                {order.deliveryPerson && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-700">Driver: {order.deliveryPerson.firstName} {order.deliveryPerson.lastName}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{order.restaurant?.name?.substring(0, 2)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{order.restaurant?.name}</h3>
              <p className="text-gray-600 text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
              <p className="text-gray-600 text-sm">
                <MapPin className="h-4 w-4 inline mr-1" />
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">×{item.quantity}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.pricing?.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.pricing?.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatCurrency(order.pricing?.serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.pricing?.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.pricing?.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="flex-1"
            >
              Reorder
            </Button>
            <Button 
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Receipt
            </Button>
            {order.status === 'delivered' && !order.rating && (
              <Button variant="outline">
                Rate Order
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <Card.Content className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading orders</h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card.Content>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your order history</p>
          </div>

          {/* Filters and Search */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by restaurant or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <Card.Content className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'You haven\'t placed any orders yet'}
                  </p>
                  <Button onClick={() => window.location.href = '/businesses'}>
                    Browse Businesses
                  </Button>
                </Card.Content>
              </Card>
            ) : (
              filteredOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <Card.Content className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          {/* Order Info */}
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {order.restaurant?.name?.substring(0, 2)}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{order.restaurant?.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                  {statusConfig.text}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                Order #{order.orderNumber} • {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                              </p>
                              
                              <p className="text-sm text-gray-600">
                                {formatRelativeTime(order.createdAt)}
                                {order.status === 'delivered' && order.actualDeliveryTime && 
                                  ` • Delivered in ${Math.round((new Date(order.actualDeliveryTime) - new Date(order.createdAt)) / 60000)} min`
                                }
                              </p>

                              {order.rating && (
                                <div className="flex items-center space-x-1 mt-2">
                                  {renderStars(order.rating.overall)}
                                  <span className="text-sm text-gray-600 ml-1">
                                    ({order.rating.overall}.0)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-semibold text-lg text-gray-900">
                                {formatCurrency(order.pricing?.total)}
                              </p>
                              {order.status === 'on_the_way' && order.estimatedDeliveryTime && (
                                <p className="text-sm text-blue-600">
                                  ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                leftIcon={<Eye className="h-4 w-4" />}
                                onClick={() => setSelectedOrder(order)}
                              >
                                View Details
                              </Button>
                              
                              {order.status === 'delivered' && (
                                <Button 
                                  size="sm"
                                  leftIcon={<RotateCcw className="h-4 w-4" />}
                                >
                                  Reorder
                                </Button>
                              )}
                              
                              {order.status === 'on_the_way' && order.deliveryPerson?.phone && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  leftIcon={<Phone className="h-4 w-4" />}
                                >
                                  Call Driver
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default OrdersPage;