import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield,
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Edit3,
  Trash2,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  Building,
  Truck,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
    pendingVerifications: 0
  });
  
  const [users, setUsers] = useState([]);
  const [businesses, setBusiness] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsResponse = await adminService.getUserStats();
        setStats({
          totalUsers: statsResponse.data.totalUsers || 0,
          totalBusinesses: statsResponse.data.summary?.businessOwners || 0,
          totalOrders: 0, // We'll need to add order stats endpoint
          totalRevenue: 0, // We'll need to add revenue stats endpoint
          activeDeliveries: statsResponse.data.summary?.deliveryPersons || 0,
          pendingVerifications: 0 // We'll need to add verification stats endpoint
        });

        // Fetch users
        const usersResponse = await adminService.getAllUsers({
          page: 1,
          limit: 10
        });
        
        // Transform users data to match component expectations
        const transformedUsers = usersResponse.data.users.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          joinDate: new Date(user.createdAt),
          // Add role-specific data
          ...(user.role === 'customer' && {
            totalOrders: 0, // Would need order data
            totalSpent: 0   // Would need payment data
          }),
          ...(user.role === 'delivery_person' && {
            totalDeliveries: user.deliveryPersonProfile?.totalDeliveries || 0,
            rating: user.deliveryPersonProfile?.rating || 0
          }),
          ...(user.role === 'business_owner' && {
            businessName: user.businessProfile?.businessId?.name || 'Not set',
            verificationStatus: user.businessProfile?.verificationStatus || 'pending'
          })
        }));
        
        setUsers(transformedUsers);

        // For businesses, we would need a separate endpoint
        // For now, let's extract business owners' businesses
        const businessUsers = usersResponse.data.users
          .filter(u => u.role === 'business_owner' && u.businessProfile?.businessId)
          .map(user => ({
            id: user.businessProfile.businessId._id,
            name: user.businessProfile.businessId.name,
            owner: `${user.firstName} ${user.lastName}`,
            category: user.businessProfile.businessId.businessType,
            status: user.businessProfile.verificationStatus || 'pending',
            rating: user.businessProfile.businessId.rating || 0,
            totalOrders: 0, // Would need order data
            revenue: 0,     // Would need revenue data
            joinDate: new Date(user.businessProfile.businessId.createdAt)
          }));
        
        setBusiness(businessUsers);

        // Mock recent activity (would need a real activity log endpoint)
        setRecentActivity([
          {
            id: 1,
            type: 'user_registration',
            message: 'New user registered: Sarah Johnson',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            icon: UserPlus,
            color: 'text-green-600'
          },
          {
            id: 2,
            type: 'business_verification',
            message: 'Business verification completed: Taco Bell',
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            icon: CheckCircle,
            color: 'text-blue-600'
          },
          {
            id: 3,
            type: 'order_dispute',
            message: 'Order dispute reported: #ORD12345',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            icon: AlertTriangle,
            color: 'text-yellow-600'
          }
        ]);

      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      // In a real implementation, we would call the API to update user status
      // For now, we'll just update the UI
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleBusinessStatusChange = async (businessId, newStatus) => {
    try {
      // In a real implementation, we would call the API to update business status
      // For now, we'll just update the UI
      setBusiness(businesses.map(business => 
        business.id === businessId 
          ? { ...business, status: newStatus }
          : business
      ));
      toast.success(`Business status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    }
  };

  const getUserStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'suspended': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBusinessStatusColor = (status) => {
    const colors = {
      'verified': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'under_review': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'customer': Users,
      'delivery_person': Truck,
      'business_owner': Building,
      'admin': Shield
    };
    return icons[role] || Users;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'businesses', label: 'Business Management', icon: Store },
    { id: 'orders', label: 'Order Management', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Store className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Businesses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBusinesses}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Truck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivery Persons</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeDeliveries}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingVerifications}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-full ${activity.color} bg-opacity-10`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        {/* User Distribution */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Distribution</h3>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Customers</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalUsers - stats.totalBusinesses - stats.activeDeliveries - 1} {/* -1 for admin */}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Business Owners</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.totalBusinesses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Delivery Persons</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.activeDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Admins</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 capitalize">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          leftIcon={<Eye className="h-3 w-3" />}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          leftIcon={<Edit3 className="h-3 w-3" />}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <div className="space-y-6">
      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Card.Content className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                  <p className="text-sm text-gray-500">Owner: {business.owner}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBusinessStatusColor(business.status)}`}>
                  {business.status}
                </span>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span className="capitalize">{business.category || 'Not specified'}</span>
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="flex-shrink-0 mr-1.5 h-4 w-4 text-yellow-400" />
                  <span>{business.rating || 'N/A'}</span>
                </div>
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <Package className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{business.totalOrders || 0} orders</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span>{formatCurrency(business.revenue || 0)}</span>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  leftIcon={<Eye className="h-3 w-3" />}
                >
                  View
                </Button>
                {business.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      leftIcon={<CheckCircle className="h-3 w-3" />}
                      onClick={() => handleBusinessStatusChange(business.id, 'verified')}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      leftIcon={<XCircle className="h-3 w-3" />}
                      onClick={() => handleBusinessStatusChange(business.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Platform management and oversight</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'businesses' && renderBusinesses()}
          {['orders', 'reports', 'settings'].includes(activeTab) && (
            <div className="text-center py-12">
              <p className="text-gray-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

// Add missing Star icon import
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default AdminDashboard;