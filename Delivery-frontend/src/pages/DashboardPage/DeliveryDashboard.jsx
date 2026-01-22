import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Navigation,
  User,
  Settings,
  Star,
  Calendar,
  TrendingUp,
  Play,
  Pause,
  Phone,
  MessageSquare,
  Route,
  AlertCircle
} from 'lucide-react';
import { useAuth, useDelivery } from '../../context';
import socketService from '../../services/socketService';
import { Button, Card } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency, formatRelativeTime } from '../../utils';
import { deliveryService } from '../../services';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { 
    deliveryPerson, 
    availableOrders, 
    assignedOrders, 
    fetchDeliveryProfile, 
    updateDeliveryStatus, 
    fetchAvailableOrders, 
    fetchAssignedOrders,
    acceptOrder,
    declineOrder,
    updateOrderStatus
  } = useDelivery();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    rating: 4.8,
    totalDeliveries: 0
  });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deliveryPersonProfile: {
      vehicleType: 'walking',
      licenseNumber: '',
      licenseExpiry: '',
      insuranceNumber: '',
      workingAreas: [{ city: '', radius: 10 }],
      emergencyContact: { name: '', phone: '' }
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [files, setFiles] = useState({
    licenseDocument: null,
    insuranceDocument: null
  });

  // Get current location with improved error handling
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        toast.error('Geolocation is not supported by your browser');
        return;
      }

      // Set a timeout for the geolocation request
      const timeoutId = setTimeout(() => {
        setLocationError('Location request timed out');
        toast.error('Location request timed out. Please try again.');
      }, 10000); // 10 seconds timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
          
          // Update location on server
          deliveryService.updateLocation(user?.id, position.coords.latitude, position.coords.longitude)
            .catch(error => {
              console.error('Failed to update location on server:', error);
            });
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Location error:', error);
          
          // Handle specific error codes with better messages
          let errorMessage = 'Unable to get current location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Location error: ${error.message || 'Unknown error'}`;
              break;
          }
          
          setLocationError(errorMessage);
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    getLocation();
    
    // Listen for real-time location updates
    socketService.onLocationUpdate((data) => {
      if (data.userId !== user?.id) {
        // This is for other delivery persons or customers tracking
        console.log('Location updated for user:', data);
      }
    });
    
    return () => {
      socketService.offLocationUpdate();
    };
  }, [user?.id]);

  // Fetch real delivery data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch delivery profile
        await fetchDeliveryProfile();
        
        // Fetch available orders
        await fetchAvailableOrders();
        
        // Fetch assigned orders
        await fetchAssignedOrders();
        
        // Fetch delivery stats
        const statsResponse = await deliveryService.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching delivery data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user profile when profile tab is active
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (activeTab === 'profile' && user) {
        try {
          setProfileLoading(true);
          const response = await deliveryService.getProfile();
          if (response.success) {
            setProfileData({
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              deliveryPersonProfile: response.data.deliveryPersonProfile || {}
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setProfileError('Failed to load profile data');
          toast.error('Failed to load profile data');
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [activeTab, user]);

  // Listen for notifications
  useEffect(() => {
    const handleNotification = (data) => {
      console.log('Received notification:', data);
      toast.success(data.message || 'New notification');
      
      // Refresh data when order status changes
      if (data.type === 'order_update' || data.type === 'delivery_update') {
        fetchAssignedOrders();
        fetchAvailableOrders();
      }
    };
    
    socketService.on('notification', handleNotification);
    
    return () => {
      socketService.off('notification', handleNotification);
    };
  }, [fetchAssignedOrders, fetchAvailableOrders]);

  const handleAvailabilityToggle = async () => {
    try {
      setLoading(true);
      const response = await updateDeliveryStatus(!isAvailable);
      
      if (response.success) {
        setIsAvailable(!isAvailable);
        toast.success(`You are now ${!isAvailable ? 'online' : 'offline'}`);
      } else {
        toast.error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await acceptOrder(orderId);
      
      if (response.success) {
        toast.success('Order accepted!');
      } else {
        toast.error(response.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await declineOrder(orderId);
      
      if (response.success) {
        toast.success('Order declined');
      } else {
        toast.error(response.message || 'Failed to decline order');
      }
    } catch (error) {
      console.error('Error declining order:', error);
      toast.error('Failed to decline order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFiles(prev => ({ ...prev, [name]: file }));
    }
  };
  
  const uploadDocuments = async (token) => {
    if (!files.licenseDocument && !files.insuranceDocument) {
      return { success: true };
    }

    try {
      const formData = new FormData();
      
      if (files.licenseDocument) {
        formData.append('licenseDocument', files.licenseDocument);
      }
      
      if (files.insuranceDocument) {
        formData.append('insuranceDocument', files.insuranceDocument);
      }

      const response = await fetch('/api/upload/license-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload documents');
      }

      return data;
    } catch (error) {
      console.error('Upload documents error:', error);
      throw error;
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setProfileLoading(true);
      
      // Validate required fields
      if (!profileData.firstName.trim() || !profileData.lastName.trim() || 
          !profileData.email.trim() || !profileData.phone.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate license fields for motorized vehicles
      if (['motorcycle', 'car', 'van', 'truck'].includes(profileData.deliveryPersonProfile.vehicleType)) {
        if (!profileData.deliveryPersonProfile.licenseNumber.trim()) {
          toast.error('License number is required for motorized vehicles');
          return;
        }
        if (!profileData.deliveryPersonProfile.licenseExpiry) {
          toast.error('License expiry date is required for motorized vehicles');
          return;
        }
      }
      
      // Validate insurance for vehicles that require it
      if (['car', 'van', 'truck', 'motorcycle'].includes(profileData.deliveryPersonProfile.vehicleType)) {
        if (!profileData.deliveryPersonProfile.insuranceNumber.trim()) {
          toast.error('Insurance number is required for this vehicle type');
          return;
        }
      }
      
      // Validate emergency contact
      if (!profileData.deliveryPersonProfile.emergencyContact?.name?.trim() || 
          !profileData.deliveryPersonProfile.emergencyContact?.phone?.trim()) {
        toast.error('Emergency contact information is required');
        return;
      }
      
      // Validate working areas
      if (!profileData.deliveryPersonProfile.workingAreas || 
          profileData.deliveryPersonProfile.workingAreas.length === 0 ||
          profileData.deliveryPersonProfile.workingAreas.some(area => !area.city.trim())) {
        toast.error('Please specify at least one working area with a city name');
        return;
      }
      
      // Prepare data for submission
      const updateData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.toLowerCase().trim(),
        phone: profileData.phone.trim(),
        deliveryPersonProfile: profileData.deliveryPersonProfile
      };
      
      // Call the API to update profile
      const response = await deliveryService.updateProfile(updateData);
      
      if (response.success) {
        // Upload documents if any
        try {
          const token = localStorage.getItem('token');
          if (token) {
            await uploadDocuments(token);
            toast.success('Profile and documents updated successfully');
          } else {
            toast.success('Profile updated successfully');
          }
          // Update the user context
          fetchDeliveryProfile();
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          toast.success('Profile updated successfully! Please upload your documents from your profile.');
        }
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ready': 'bg-blue-100 text-blue-800',
      'assigned': 'bg-orange-100 text-orange-800',
      'accepted': 'bg-green-100 text-green-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'on_the_way': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'ready': 'Ready for Pickup',
      'assigned': 'Assigned to You',
      'accepted': 'Accepted',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered'
    };
    return texts[status] || status;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Truck },
    { id: 'orders', label: 'Available Orders', icon: Package },
    { id: 'active', label: 'Active Deliveries', icon: Route },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Location Status */}
      {locationError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <Card.Content className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">{locationError}</p>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Availability Toggle */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Truck className={`h-6 w-6 ${isAvailable ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Status</h3>
                <p className="text-sm text-gray-600">
                  You are currently {isAvailable ? 'online and available' : 'offline'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAvailabilityToggle}
              variant={isAvailable ? 'outline' : 'primary'}
              leftIcon={isAvailable ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              disabled={loading}
            >
              {isAvailable ? 'Go Offline' : 'Go Online'}
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
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
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
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayEarnings)}</p>
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
                <p className="text-sm text-gray-600">Weekly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weeklyEarnings)}</p>
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

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Deliveries</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {assignedOrders.slice(0, 3).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">{order.restaurant?.name || 'Restaurant'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customer?.firstName} {order.customer?.lastName} • {order.distance} km • {formatCurrency(order.pricing?.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(order.pricing?.deliveryFee)}</p>
                  <p className="text-sm text-gray-500">
                    {order.estimatedDeliveryTime ? formatRelativeTime(order.estimatedDeliveryTime) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Available Orders</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{isAvailable ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {!isAvailable && (
        <Card className="border-yellow-200 bg-yellow-50">
          <Card.Content className="p-4">
            <p className="text-yellow-800">
              You're currently offline. Go online to receive delivery requests.
            </p>
          </Card.Content>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      <div className="space-y-4">
        {availableOrders.map((order) => (
          <Card key={order._id} className="border-l-4 border-l-orange-500">
            <Card.Content className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.restaurant?.name || 'Restaurant'}</h3>
                  <p className="text-sm text-gray-600">{order.restaurant?.address || 'Restaurant Address'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pickup from:</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {order.restaurant?.address || 'Restaurant Address'}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deliver to:</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <User className="h-4 w-4 mr-1" />
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{order.estimatedDeliveryTime ? formatRelativeTime(order.estimatedDeliveryTime) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{order.distance} km</span>
                  </div>
                  <div className="flex items-center font-semibold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{formatCurrency(order.pricing?.deliveryFee)}</span>
                  </div>
                  {order.preferredVehicleType && (
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="capitalize">{order.preferredVehicleType}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDeclineOrder(order._id)}
                    disabled={!isAvailable || loading}
                  >
                    Decline
                  </Button>
                  <Button 
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={!isAvailable || loading}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderActiveDeliveries = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Active Deliveries</h2>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}
      
      <div className="space-y-4">
        {assignedOrders.filter(order => ['assigned', 'accepted', 'picked_up', 'on_the_way'].includes(order.status)).map((order) => (
          <Card key={order._id} className="border-l-4 border-l-blue-500">
            <Card.Content className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">{order.restaurant?.name || 'Restaurant'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer:</h4>
                  <p className="text-sm text-gray-600">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button size="sm" variant="outline" leftIcon={<Phone className="h-3 w-3" />}>
                      Call
                    </Button>
                    <Button size="sm" variant="outline" leftIcon={<MessageSquare className="h-3 w-3" />}>
                      Message
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address:</h4>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </p>
                  <Button size="sm" className="mt-2" leftIcon={<Navigation className="h-3 w-3" />}>
                    Navigate
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                {order.status === 'assigned' && (
                  <Button 
                    onClick={() => handleUpdateStatus(order._id, 'picked_up')}
                    disabled={loading}
                  >
                    Mark as Picked Up
                  </Button>
                )}
                {order.status === 'picked_up' && (
                  <Button 
                    onClick={() => handleUpdateStatus(order._id, 'on_the_way')}
                    disabled={loading}
                  >
                    Start Delivery
                  </Button>
                )}
                {order.status === 'on_the_way' && (
                  <Button 
                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                    disabled={loading}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Delivery Profile</h2>
      
      {profileLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}
      
      {profileError && (
        <Card className="border-red-200 bg-red-50">
          <Card.Content className="p-4">
            <p className="text-red-800">{profileError}</p>
          </Card.Content>
        </Card>
      )}
      
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Personal Information</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Delivery Information</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={profileData.deliveryPersonProfile.vehicleType}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  deliveryPersonProfile: { 
                    ...profileData.deliveryPersonProfile, 
                    vehicleType: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="walking">Walking</option>
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            
            {['motorcycle', 'car', 'van', 'truck'].includes(profileData.deliveryPersonProfile.vehicleType) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      value={profileData.deliveryPersonProfile.licenseNumber}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        deliveryPersonProfile: { 
                          ...profileData.deliveryPersonProfile, 
                          licenseNumber: e.target.value 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                    <input
                      type="date"
                      value={profileData.deliveryPersonProfile.licenseExpiry}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        deliveryPersonProfile: { 
                          ...profileData.deliveryPersonProfile, 
                          licenseExpiry: e.target.value 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                {['car', 'van', 'truck', 'motorcycle'].includes(profileData.deliveryPersonProfile.vehicleType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                    <input
                      type="text"
                      value={profileData.deliveryPersonProfile.insuranceNumber}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        deliveryPersonProfile: { 
                          ...profileData.deliveryPersonProfile, 
                          insuranceNumber: e.target.value 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
                            
                {/* Document Upload Section */}
                {profileData.deliveryPersonProfile.vehicleType && profileData.deliveryPersonProfile.vehicleType !== 'walking' && (
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">Vehicle Documents</h4>
                                
                    {/* License Document Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Driver's License Document
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="licenseDocument"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      {profileData.deliveryPersonProfile.licenseDocumentUrl && (
                        <p className="text-xs sm:text-sm text-green-600">
                          ✓ Current document uploaded
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Upload a clear photo or scan of your driver's license (JPG, PNG, or PDF, max 10MB)
                      </p>
                    </div>
                
                    {/* Insurance Document Upload */}
                    {['car', 'van', 'truck', 'motorcycle'].includes(profileData.deliveryPersonProfile.vehicleType) && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Vehicle Insurance Document
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name="insuranceDocument"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        {profileData.deliveryPersonProfile.insuranceDocumentUrl && (
                          <p className="text-xs sm:text-sm text-green-600">
                            ✓ Current document uploaded
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Upload your current vehicle insurance certificate (JPG, PNG, or PDF, max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Areas</label>
              <div className="space-y-2">
                {profileData.deliveryPersonProfile.workingAreas?.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={area.city}
                      onChange={(e) => {
                        const newAreas = [...profileData.deliveryPersonProfile.workingAreas];
                        newAreas[index].city = e.target.value;
                        setProfileData({ 
                          ...profileData, 
                          deliveryPersonProfile: { 
                            ...profileData.deliveryPersonProfile, 
                            workingAreas: newAreas 
                          } 
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Radius (km)"
                      value={area.radius}
                      onChange={(e) => {
                        const newAreas = [...profileData.deliveryPersonProfile.workingAreas];
                        newAreas[index].radius = parseInt(e.target.value) || 0;
                        setProfileData({ 
                          ...profileData, 
                          deliveryPersonProfile: { 
                            ...profileData.deliveryPersonProfile, 
                            workingAreas: newAreas 
                          } 
                        });
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="1"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newAreas = [...profileData.deliveryPersonProfile.workingAreas];
                        newAreas.splice(index, 1);
                        setProfileData({ 
                          ...profileData, 
                          deliveryPersonProfile: { 
                            ...profileData.deliveryPersonProfile, 
                            workingAreas: newAreas 
                          } 
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newAreas = [...(profileData.deliveryPersonProfile.workingAreas || []), { city: '', radius: 10 }];
                    setProfileData({ 
                      ...profileData, 
                      deliveryPersonProfile: { 
                        ...profileData.deliveryPersonProfile, 
                        workingAreas: newAreas 
                      } 
                    });
                  }}
                >
                  Add Working Area
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={profileData.deliveryPersonProfile.emergencyContact?.name || ''}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    deliveryPersonProfile: { 
                      ...profileData.deliveryPersonProfile, 
                      emergencyContact: { 
                        ...profileData.deliveryPersonProfile.emergencyContact, 
                        name: e.target.value 
                      } 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={profileData.deliveryPersonProfile.emergencyContact?.phone || ''}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    deliveryPersonProfile: { 
                      ...profileData.deliveryPersonProfile, 
                      emergencyContact: { 
                        ...profileData.deliveryPersonProfile.emergencyContact, 
                        phone: e.target.value 
                      } 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={() => {
            // Reset form to original values
            fetchDeliveryProfile();
          }}>
            Cancel
          </Button>
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Driver'}!</p>
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
          {activeTab === 'active' && renderActiveDeliveries()}
          {activeTab === 'profile' && renderProfile()}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DeliveryDashboard;