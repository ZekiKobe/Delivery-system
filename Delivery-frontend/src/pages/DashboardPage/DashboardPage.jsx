import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Clock, 
  MapPin, 
  Star, 
  Settings, 
  CreditCard, 
  Heart, 
  Bell,
  Edit3,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp,
  Award,
  Loader
} from 'lucide-react';
import { useAuth, useOrder } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency, formatRelativeTime } from '../../utils';
import { orderService, userService } from '../../services';
import toast from 'react-hot-toast';
import DeliveryDashboard from './DeliveryDashboard';
import BusinessDashboard from './BusinessDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { orders } = useOrder();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Fetch user dashboard data based on role
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on user role
        let statsResponse = { success: true, data: { stats: {} } };
        let ordersResponse = { success: true, data: { orders: [] } };
        
        if (user && user.role === 'customer') {
          // Customer-specific data fetching
          [statsResponse, ordersResponse] = await Promise.all([
            userService.getUserStats?.() || Promise.resolve({ success: true, data: { stats: {} } }),
            orderService.getUserOrders({ limit: 10, sort: '-createdAt' })
          ]);
        } else if (user && user.role === 'business_owner') {
          // Business owner-specific data fetching
          [statsResponse, ordersResponse] = await Promise.all([
            Promise.resolve({ success: true, data: { stats: {} } }), // Business stats would come from business service
            orderService.getRestaurantOrders({ limit: 10, status: 'all' })
          ]);
        } else if (user && user.role === 'delivery_person') {
          // Delivery person-specific data fetching
          [statsResponse, ordersResponse] = await Promise.all([
            Promise.resolve({ success: true, data: { stats: {} } }), // Delivery stats would come from delivery service
            orderService.getDeliveryOrders({ limit: 10, status: 'all' })
          ]);
        } else if (user && user.role === 'admin') {
          // Admin-specific data fetching
          [statsResponse, ordersResponse] = await Promise.all([
            Promise.resolve({ success: true, data: { stats: {} } }), // Admin stats would come from admin service
            Promise.resolve({ success: true, data: { orders: [] } }) // Admin might get orders differently
          ]);
        }

        if (statsResponse.success) {
          setUserStats(statsResponse.data.stats);
        }

        if (ordersResponse.success) {
          // For business owners, the response structure is different
          if (user && user.role === 'business_owner') {
            setOrderHistory(ordersResponse.data.orders || []);
          } else if (user && user.role === 'delivery_person') {
            setOrderHistory(ordersResponse.data.orders || []);
          } else {
            setOrderHistory(ordersResponse.data.orders || []);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data for customer role, other roles have their own dashboards
    if (user && user.role === 'customer') {
      fetchDashboardData();
    } else {
      // For other roles, we don't need to fetch data here as they have dedicated dashboards
      setLoading(false);
    }
  }, [user]);

  // Get user data with fallbacks
  const userData = {
    name: user?.name || 'User',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0] ? 
      `${user.addresses[0].street}, ${user.addresses[0].city}` : 
      'No address added',
    memberSince: user?.createdAt || new Date().toISOString(),
    totalOrders: userStats?.totalOrders || orderHistory.length || 0,
    totalSpent: userStats?.totalSpent || 0,
    favoriteRestaurant: userStats?.favoriteRestaurant || 'Not available'
  };

  // Loading state
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

  // Role-specific dashboard rendering - all hooks must be called before these conditional returns
  if (user && user.role === 'delivery_person') {
    return <DeliveryDashboard />;
  }

  if (user && user.role === 'business_owner') {
    return <BusinessDashboard />;
  }

  if (user && user.role === 'admin') {
    return <AdminDashboard />;
  }

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'text-green-600 bg-green-100',
      'out-for-delivery': 'text-blue-600 bg-blue-100',
      'preparing': 'text-yellow-600 bg-yellow-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'favorites', label: 'Favorites', icon: Heart }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{userData.totalOrders}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(userData.totalSpent)}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">{new Date(userData.memberSince).getFullYear()}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
        </Card.Header>
        <Card.Content>
          {orderHistory.length > 0 ? (
            <div className="space-y-4">
              {orderHistory.slice(0, 3).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{formatRelativeTime(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount || order.pricing?.total)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent orders</p>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          View All Orders
        </Button>
      </div>

      {orderHistory.length > 0 ? (
        <div className="space-y-4">
          {orderHistory.map((order) => (
            <Card key={order._id}>
              <Card.Content className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount || order.pricing?.total)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {order.items?.map((item, index) => (
                        <li key={index}>• {item.name} x{item.quantity}</li>
                      )) || <li>No items available</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address:</h4>
                    <p className="text-sm text-gray-600">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order._id}`)}>
                    View Details
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Content className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start ordering to see your order history here.</p>
            <Button onClick={() => navigate('/restaurants')}>
              Browse Restaurants
            </Button>
          </Card.Content>
        </Card>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Profile Information</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={userData.name.split(' ')[0] || ''}
              disabled
            />
            <Input
              label="Last Name"
              value={userData.name.split(' ')[1] || ''}
              disabled
            />
            <Input
              label="Email"
              value={userData.email}
              disabled
            />
            <Input
              label="Phone"
              value={userData.phone}
              disabled
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Address
            </label>
            <div className="p-4 border border-gray-300 rounded-md">
              <p className="text-gray-900">{userData.address}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => navigate('/settings')}>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Preferences</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive order updates via email</p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive order updates via SMS</p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive push notifications</p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Favorite Items</h2>
      </div>
      
      <Card>
        <Card.Content className="p-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-4">Start adding items to your favorites to see them here.</p>
          <Button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </Card.Content>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return renderOrders();
      case 'profile':
        return renderProfile();
      case 'favorites':
        return renderFavorites();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {userData.name}!</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;