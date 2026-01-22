import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Settings,
  Plus,
  Edit3,
  Eye,
  BarChart3,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Menu,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import MenuItemModal from '../../components/MenuItemModal/MenuItemModal';
import { formatCurrency, formatRelativeTime } from '../../utils';
import { businessDashboardService } from '../../services';
import toast from 'react-hot-toast';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [businessStatus, setBusinessStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    rating: 0,
    totalOrders: 0
  });
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    businessType: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    operatingHours: {
      open: '09:00',
      close: '22:00'
    },
    deliveryInfo: {
      deliveryRadius: 5,
      minimumOrder: 50,
      deliveryFee: 20,
      freeDeliveryThreshold: 200
    }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    search: ''
  });
  const [menuFilters, setMenuFilters] = useState({
    category: '',
    isAvailable: '',
    search: ''
  });
  const [menuItemModal, setMenuItemModal] = useState({
    isOpen: false,
    editingItem: null
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [needsBusinessSetup, setNeedsBusinessSetup] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'menu') {
      loadMenuItems();
    } else if (activeTab === 'business') {
      loadBusinessInfo();
    }
  }, [activeTab, orderFilters, menuFilters, pagination.page]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await businessDashboardService.getDashboardOverview();
      
      if (response.success) {
        if (response.data.needsBusinessSetup) {
          setNeedsBusinessSetup(true);
          toast.info(response.data.message);
          return;
        }
        
        const { business, stats: dashboardStats, recentOrders } = response.data;
        
        // Update business info
        setBusinessInfo({
          name: business.name || '',
          businessType: business.businessType || '',
          address: '', // Will be loaded in business info tab
          phone: '',
          email: '',
          operatingHours: {
            open: '09:00',
            close: '22:00'
          }
        });
        
        // Update stats
        setStats(dashboardStats);
        
        // Update business status based on API data
        setBusinessStatus(business.status === 'active' ? 'open' : 'closed');
        
        // Set recent orders for overview
        setOrders(recentOrders || []);
        setNeedsBusinessSetup(false);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Only add non-empty filter values
      if (orderFilters.status && orderFilters.status.trim() !== '') {
        params.status = orderFilters.status;
      }
      if (orderFilters.search && orderFilters.search.trim() !== '') {
        params.search = orderFilters.search;
      }
      
      const response = await businessDashboardService.getOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const loadMenuItems = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Only add non-empty filter values
      if (menuFilters.category && menuFilters.category.trim() !== '') {
        params.category = menuFilters.category;
      }
      if (menuFilters.search && menuFilters.search.trim() !== '') {
        params.search = menuFilters.search;
      }
      if (menuFilters.isAvailable !== '') {
        params.isAvailable = menuFilters.isAvailable;
      }
      
      const response = await businessDashboardService.getMenuItems(params);
      
      if (response.success) {
        setMenuItems(response.data.menuItems);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  const loadBusinessInfo = async () => {
    try {
      // Get the business info from the businesses endpoint
      const response = await businessDashboardService.getDashboardOverview();
      
      if (response.success && response.data.business) {
        const business = response.data.business;
        
        // Load complete business data if needed
        // For now, we'll use the overview data and extend it
        setBusinessInfo({
          name: business.name || '',
          businessType: business.businessType || '',
          address: business.address || '',
          phone: business.contact?.phone || '',
          email: business.contact?.email || '',
          website: business.contact?.website || '',
          operatingHours: business.operatingHours || {
            open: '09:00',
            close: '22:00'
          },
          deliveryInfo: business.deliveryInfo || {
            deliveryRadius: 5,
            minimumOrder: 50,
            deliveryFee: 20,
            freeDeliveryThreshold: 200
          }
        });
      }
    } catch (error) {
      console.error('Failed to load business info:', error);
      toast.error('Failed to load business information');
    }
  };

  const handleBusinessStatusToggle = async () => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before updating business status');
      return;
    }
    
    try {
      const response = await businessDashboardService.toggleBusinessStatus();
      
      if (response.success) {
        const newStatus = response.data.acceptsOrders ? 'open' : 'closed';
        setBusinessStatus(newStatus);
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Failed to toggle business status:', error);
      toast.error(error.message || 'Failed to update business status');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before managing orders');
      return;
    }
    
    try {
      const response = await businessDashboardService.updateOrderStatus(orderId, {
        status: newStatus
      });
      
      if (response.success) {
        // Update orders in state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleToggleMenuItem = async (itemId) => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before managing menu items');
      return;
    }
    
    try {
      const response = await businessDashboardService.toggleMenuItemAvailability(itemId);
      
      if (response.success) {
        // Update menu items in state
        setMenuItems(menuItems.map(item => 
          item._id === itemId 
            ? { ...item, isAvailable: response.data.menuItem.isAvailable }
            : item
        ));
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Failed to toggle menu item:', error);
      toast.error(error.message || 'Failed to update menu item');
    }
  };

  const handleDuplicateMenuItem = async (itemId) => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before managing menu items');
      return;
    }
    
          try {
        const response = await businessDashboardService.duplicateMenuItem(itemId);
        
        if (response.success) {
          // Add duplicated item to state
          setMenuItems(prev => [response.data.menuItem, ...prev]);
          toast.success(response.message);
        }
    } catch (error) {
      console.error('Failed to duplicate menu item:', error);
      toast.error(error.message || 'Failed to duplicate menu item');
    }
  };

  const handleBulkAction = async () => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before managing menu items');
      return;
    }
    
    if (!bulkAction || selectedItems.length === 0) {
      toast.error('Please select items and choose an action');
      return;
    }

    try {
      if (bulkAction === 'delete') {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
          return;
        }
        
        // Delete selected items
        const deletePromises = selectedItems.map(id => 
          businessDashboardService.deleteMenuItem(id)
        );
        
        await Promise.all(deletePromises);
        
        // Update state
        setMenuItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
        setSelectedItems([]);
        toast.success(`${selectedItems.length} items deleted successfully`);
      } else if (bulkAction === 'enable' || bulkAction === 'disable') {
        // Bulk update availability
        const items = selectedItems.map(id => ({
          id,
          updates: { isAvailable: bulkAction === 'enable' }
        }));
        
        const response = await businessDashboardService.bulkUpdateMenuItems(items);
        
        if (response.success) {
          // Update state
          setMenuItems(prev => prev.map(item => 
            selectedItems.includes(item._id) 
              ? { ...item, isAvailable: bulkAction === 'enable' }
              : item
          ));
          setSelectedItems([]);
          setBulkAction('');
          toast.success(response.message);
        }
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(menuItems.map(item => item._id));
    }
  };

  const handleExportOrders = async () => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before exporting orders');
      return;
    }
    
    try {
      const exportParams = {};
      
      // Only add non-empty filter values
      if (orderFilters.status && orderFilters.status.trim() !== '') {
        exportParams.status = orderFilters.status;
      }
      if (orderFilters.search && orderFilters.search.trim() !== '') {
        exportParams.search = orderFilters.search;
      }
      
      await businessDashboardService.exportOrders(exportParams);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Failed to export orders:', error);
      toast.error(error.message || 'Failed to export orders');
    }
  };

  // Modal handlers
  const openMenuItemModal = (item = null) => {
    if (needsBusinessSetup) {
      toast.error('Please complete your business setup before creating menu items');
      return;
    }
    
    setMenuItemModal({
      isOpen: true,
      editingItem: item
    });
  };

  const closeMenuItemModal = () => {
    setMenuItemModal({
      isOpen: false,
      editingItem: null
    });
  };

  const handleMenuItemSave = (savedItem) => {
    if (menuItemModal.editingItem) {
      // Update existing item in state
      setMenuItems(prev => prev.map(item => 
        item._id === savedItem._id ? savedItem : item
      ));
    } else {
      // Add new item to state
      setMenuItems(prev => [savedItem, ...prev]);
    }
    closeMenuItemModal();
  };

  const renderBusinessSetup = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <Card className="text-center">
          <Card.Content className="p-12">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-10 w-10 text-orange-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Business Dashboard!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              To get started, you need to set up your business profile. This will allow you to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Manage your products/menu</span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Track sales and revenue</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">View analytics and insights</span>
                </div>
              </div>
              
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Process orders in real-time</span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Connect with customers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Customize your settings</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={() => navigate('/business-setup')}
              >
                Set Up My Business
              </Button>
              
              <p className="text-sm text-gray-500">
                Already have a business registered? Contact support for assistance.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Business Setup Note</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Business coordinates will be set to default values initially. You can update them later from your business settings for accurate delivery calculations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );

  const getOrderStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusIcon = (status) => {
    const icons = {
      'pending': Clock,
      'confirmed': CheckCircle,
      'preparing': RefreshCw,
      'ready': Package,
      'picked_up': Package,
      'delivered': CheckCircle,
      'cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'menu', label: 'Menu Management', icon: Menu },
    { id: 'business', label: 'Business Info', icon: Store }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Business Status Toggle */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${businessStatus === 'open' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Store className={`h-6 w-6 ${businessStatus === 'open' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Business Status</h3>
                <p className="text-sm text-gray-600">
                  Your business is currently {businessStatus}
                </p>
              </div>
            </div>
            <Button
              onClick={handleBusinessStatusToggle}
              variant={businessStatus === 'open' ? 'outline' : 'primary'}
              className={businessStatus === 'open' ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
            >
              {businessStatus === 'open' ? 'Close Business' : 'Open Business'}
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weeklyRevenue)}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}/5.0</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Recent Orders</Card.Title>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('orders')}
              rightIcon={<Package className="h-4 w-4" />}
            >
              View All Orders
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.customer?.firstName} {order.customer?.lastName} • {order.items?.length || 0} items • {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
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
        <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleExportOrders()}
          >
            Export
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => loadOrders()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Order Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search orders..."
              value={orderFilters.search}
              onChange={(e) => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={orderFilters.status}
              onChange={(e) => setOrderFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="picked_up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={() => loadOrders()}>Apply Filters</Button>
          </div>
        </Card.Content>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-l-4 border-l-blue-500">
              <Card.Content className="p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = getOrderStatusIcon(order.status);
            return (
              <Card key={order._id} className="border-l-4 border-l-blue-500">
                <Card.Content className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Customer:</strong> {order.customer?.firstName} {order.customer?.lastName} • {order.customer?.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Ordered:</strong> {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.items?.map((item, index) => (
                          <li key={index}>• {item.name} x{item.quantity} - {formatCurrency(item.price * item.quantity)}</li>
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

                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleOrderStatusUpdate(order._id, 'confirmed')}
                          size="sm"
                        >
                          Accept Order
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleOrderStatusUpdate(order._id, 'cancelled')}
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleOrderStatusUpdate(order._id, 'preparing')}
                        size="sm"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        onClick={() => handleOrderStatusUpdate(order._id, 'ready')}
                        size="sm"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    <Button variant="outline" size="sm" leftIcon={<Phone className="h-3 w-3" />}>
                      Call Customer
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <Card.Content className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Orders will appear here when customers place them.</p>
          </Card.Content>
        </Card>
      )}
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
        <Button 
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => openMenuItemModal()}
        >
          Add New Item
        </Button>
      </div>

      {/* Menu Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search menu items..."
              value={menuFilters.search}
              onChange={(e) => setMenuFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Input
              placeholder="Category"
              value={menuFilters.category}
              onChange={(e) => setMenuFilters(prev => ({ ...prev, category: e.target.value }))}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={menuFilters.isAvailable}
              onChange={(e) => setMenuFilters(prev => ({ ...prev, isAvailable: e.target.value }))}
            >
              <option value="">All Items</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
            <Button onClick={() => loadMenuItems()}>Apply Filters</Button>
          </div>
        </Card.Content>
      </Card>

      {/* Bulk Actions */}
      {menuItems.length > 0 && (
        <Card>
          <Card.Content className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === menuItems.length && menuItems.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selectedItems.length} of {menuItems.length} selected
                </span>
              </div>
              
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose action...</option>
                <option value="enable">Enable Selected</option>
                <option value="disable">Disable Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              
              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedItems.length === 0}
                variant="outline"
              >
                Apply
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <Card.Content className="p-0">
                <div className="aspect-w-16 aspect-h-9">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : menuItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item._id} className={`${!item.isAvailable ? 'opacity-60' : ''}`}>
                <Card.Content className="p-0">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img 
                      src={item.images?.[0] || '/api/placeholder/200/150'} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/200/150';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</span>
                      <span className="text-sm text-gray-500">{item.preparationTime} min</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleToggleMenuItem(item._id)}
                        className={!item.isAvailable ? 'border-green-300 text-green-600' : 'border-red-300 text-red-600'}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        leftIcon={<Edit3 className="h-3 w-3" />}
                        onClick={() => openMenuItemModal(item)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDuplicateMenuItem(item._id)}
                      >
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <Card.Content className="p-12 text-center">
            <Menu className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">Start building your menu by adding your first item.</p>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => openMenuItemModal()}
            >
              Add First Menu Item
            </Button>
          </Card.Content>
        </Card>
      )}
    </div>
  );

  const renderBusinessInfo = () => {
    const handleSaveBusinessInfo = async () => {
      if (needsBusinessSetup) {
        toast.error('Please complete your business setup before updating business information');
        return;
      }
      
      try {
        const updateData = {
          name: businessInfo.name,
          description: businessInfo.description,
          contact: {
            phone: businessInfo.phone,
            email: businessInfo.email,
            website: businessInfo.website
          },
          deliveryInfo: businessInfo.deliveryInfo,
          settings: {
            preparationTime: 30 // Default value, can be made editable
          }
        };
        
        const response = await businessDashboardService.updateBusinessInfo(updateData);
        console.log('respose:',response);
        if (response.success) {
          toast.success(response.message);
          // Reload dashboard data to reflect changes
          loadDashboardData();
        }
      } catch (error) {
        console.error('Failed to update business info:', error);
        toast.error(error.message || 'Failed to update business information');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        
        {/* Basic Information */}
        <Card>
          <Card.Header>
            <Card.Title>Basic Information</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                placeholder="Enter your business name"
              />
              <Input
                label="Business Type"
                value={businessInfo.businessType}
                onChange={(e) => setBusinessInfo({...businessInfo, businessType: e.target.value})}
                placeholder="e.g., Restaurant, Grocery, Pharmacy"
                disabled
                helperText="Contact support to change business type"
              />
            </div>
            
            <Input
              label="Description"
              as="textarea"
              rows={3}
              value={businessInfo.description}
              onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
              placeholder="Describe your business..."
            />
            
            <Input
              label="Address"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
              leftIcon={<MapPin className="h-4 w-4" />}
              placeholder="Enter your business address"
            />
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card>
          <Card.Header>
            <Card.Title>Contact Information</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                leftIcon={<Phone className="h-4 w-4" />}
                placeholder="+251911000000"
              />
              <Input
                label="Email"
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="business@example.com"
              />
            </div>
            
            <Input
              label="Website (Optional)"
              value={businessInfo.website}
              onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
              placeholder="https://www.yourbusiness.com"
            />
          </Card.Content>
        </Card>

        {/* Operating Hours */}
        <Card>
          <Card.Header>
            <Card.Title>Operating Hours</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                value={businessInfo.operatingHours.open}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo, 
                  operatingHours: {...businessInfo.operatingHours, open: e.target.value}
                })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={businessInfo.operatingHours.close}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo, 
                  operatingHours: {...businessInfo.operatingHours, close: e.target.value}
                })}
              />
            </div>
            <p className="text-sm text-gray-600">
              For detailed weekly schedule management, please contact support.
            </p>
          </Card.Content>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <Card.Header>
            <Card.Title>Delivery Settings</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Delivery Radius (km)"
                type="number"
                value={businessInfo.deliveryInfo.deliveryRadius}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo,
                  deliveryInfo: {
                    ...businessInfo.deliveryInfo,
                    deliveryRadius: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="50"
                placeholder="5"
              />
              <Input
                label="Minimum Order (ETB)"
                type="number"
                value={businessInfo.deliveryInfo.minimumOrder}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo,
                  deliveryInfo: {
                    ...businessInfo.deliveryInfo,
                    minimumOrder: parseFloat(e.target.value)
                  }
                })}
                min="0"
                placeholder="50"
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Delivery Fee (ETB)"
                type="number"
                value={businessInfo.deliveryInfo.deliveryFee}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo,
                  deliveryInfo: {
                    ...businessInfo.deliveryInfo,
                    deliveryFee: parseFloat(e.target.value)
                  }
                })}
                min="0"
                placeholder="20"
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
              <Input
                label="Free Delivery Threshold (ETB)"
                type="number"
                value={businessInfo.deliveryInfo.freeDeliveryThreshold}
                onChange={(e) => setBusinessInfo({
                  ...businessInfo,
                  deliveryInfo: {
                    ...businessInfo.deliveryInfo,
                    freeDeliveryThreshold: parseFloat(e.target.value)
                  }
                })}
                min="0"
                placeholder="200"
                leftIcon={<DollarSign className="h-4 w-4" />}
                helperText="Orders above this amount get free delivery"
              />
            </div>
          </Card.Content>
        </Card>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={handleSaveBusinessInfo}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  // If business setup is needed, show the setup page
  if (needsBusinessSetup) {
    return renderBusinessSetup();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600">Welcome back, {businessInfo.name}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'menu' && renderMenu()}
          {activeTab === 'business' && renderBusinessInfo()}
        </motion.div>
      </div>

      <Footer />
      
      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={menuItemModal.isOpen}
        onClose={closeMenuItemModal}
        menuItem={menuItemModal.editingItem}
        onSave={handleMenuItemSave}
        onBusinessSetupRequired={() => setNeedsBusinessSetup(true)}
      />
    </div>
  );
};

export default BusinessDashboard;