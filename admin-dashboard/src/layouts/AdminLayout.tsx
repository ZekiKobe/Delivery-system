import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout: contextLogout, isAdmin, isBusinessOwner } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const getDashboardTitle = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isBusinessOwner) return user?.business?.name || 'Business Dashboard';
    return 'Dashboard';
  };

  const getDashboardTitleShort = () => {
    if (isAdmin) return 'AD';
    if (isBusinessOwner) return 'BD';
    return 'D';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 relative`}>
        <div className="p-4">
          <h1 className={`text-xl font-bold ${sidebarOpen ? 'block' : 'hidden'}`}>{getDashboardTitle()}</h1>
          <h1 className={`text-xl font-bold ${sidebarOpen ? 'hidden' : 'block'}`}>{getDashboardTitleShort()}</h1>
        </div>
        <nav className="mt-5">
          {/* Common navigation */}
          <Link 
            to="/" 
            className="flex items-center p-4 hover:bg-gray-700 transition-colors"
          >
            <span>📊</span>
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Dashboard</span>
          </Link>

          {/* Admin-only navigation */}
          {isAdmin && (
            <>
              <Link 
                to="/users" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>👥</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Users</span>
              </Link>
              <Link 
                to="/businesses" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>🏢</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Businesses</span>
              </Link>
              <Link 
                to="/verifications" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>✅</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Business Verifications</span>
              </Link>
              <Link 
                to="/driver-verifications" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>🚚</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Driver Verifications</span>
              </Link>
            </>
          )}

          {/* Business owner navigation */}
          {isBusinessOwner && (
            <>
              <Link 
                to="/products" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>🍽️</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Products</span>
              </Link>
              <Link 
                to="/inventory" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>📦</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Inventory</span>
              </Link>
              <Link 
                to="/business-profile" 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span>🏪</span>
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Business Profile</span>
              </Link>
            </>
          )}

          {/* Common navigation */}
          <Link 
            to="/orders" 
            className="flex items-center p-4 hover:bg-gray-700 transition-colors"
          >
            <span>📋</span>
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
              {isAdmin ? 'All Orders' : 'Orders'}
            </span>
          </Link>
          <Link 
            to="/analytics" 
            className="flex items-center p-4 hover:bg-gray-700 transition-colors"
          >
            <span>📈</span>
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Analytics</span>
          </Link>
          <Link 
            to="/settings" 
            className="flex items-center p-4 hover:bg-gray-700 transition-colors"
          >
            <span>⚙️</span>
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Settings</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0">
          <button 
            onClick={handleLogout}
            className="flex items-center p-4 hover:bg-gray-700 transition-colors text-left w-full"
          >
            <span>🚪</span>
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center p-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none hover:text-gray-700 transition-colors"
            >
              ☰
            </button>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </span>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </button>
                
                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {isBusinessOwner && user?.business && (
                        <p className="text-xs text-blue-600 font-medium">{user.business.name}</p>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="mr-3">👤</span>
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="mr-3">⚙️</span>
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;