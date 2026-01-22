import React, { useState, useEffect } from 'react';
import { getDashboardStats, getUserStats } from '../services/adminService';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentActivity: {
    orders: number;
    users: number;
    businesses: number;
    revenue: number;
  };
  distributions: {
    orderStatus: Array<{ _id: string; count: number }>;
    userRoles: Array<{ _id: string; count: number }>;
    businessTypes: Array<{ _id: string; count: number }>;
  };
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, userStatsResponse] = await Promise.all([
        getDashboardStats('30'),
        getUserStats()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setUserStats(userStatsResponse);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-green-800">System Status</h3>
              <p className="text-2xl font-bold text-green-900">Online</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-800">Response Time</h3>
              <p className="text-2xl font-bold text-blue-900">~120ms</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-yellow-800">Uptime</h3>
              <p className="text-2xl font-bold text-yellow-900">99.9%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-purple-800">Security</h3>
              <p className="text-2xl font-bold text-purple-900">Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600">+{dashboardData.recentActivity.users} this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Businesses</h3>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalBusinesses.toLocaleString()}</p>
              <p className="text-sm text-green-600">+{dashboardData.recentActivity.businesses} this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalOrders.toLocaleString()}</p>
              <p className="text-sm text-green-600">+{dashboardData.recentActivity.orders} this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+${dashboardData.recentActivity.revenue.toLocaleString()} this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
          <div className="space-y-3">
            {userStats?.byRole?.map((role: any) => (
              <div key={role._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {role._id.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(role.count / userStats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{role.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {dashboardData.distributions.orderStatus.map((status) => (
              <div key={status._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status._id.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(status.count / dashboardData.overview.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{status.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-blue-500 mr-3">📦</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{dashboardData.recentActivity.orders} new orders</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            <span className="text-sm text-green-600">+{Math.round((dashboardData.recentActivity.orders / dashboardData.overview.totalOrders) * 100)}%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 mr-3">👥</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{dashboardData.recentActivity.users} new users</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            <span className="text-sm text-green-600">+{Math.round((dashboardData.recentActivity.users / dashboardData.overview.totalUsers) * 100)}%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-purple-500 mr-3">🏢</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{dashboardData.recentActivity.businesses} new businesses</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            <span className="text-sm text-green-600">+{Math.round((dashboardData.recentActivity.businesses / dashboardData.overview.totalBusinesses) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">👥</span>
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">🏢</span>
            <span className="text-sm font-medium text-gray-700">Manage Businesses</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📦</span>
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;