import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Businesses from './pages/Businesses';
import Verifications from './pages/Verifications';
import VerificationDetail from './pages/VerificationDetail';
import DriverVerifications from './pages/DriverVerifications';
import DriverDetail from './pages/DriverDetail';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import BusinessProfile from './pages/BusinessProfile';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'business_owner';
}> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* Admin-only routes */}
        <Route path="users" element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        } />
        <Route path="businesses" element={
          <ProtectedRoute requiredRole="admin">
            <Businesses />
          </ProtectedRoute>
        } />
        <Route path="verifications" element={
          <ProtectedRoute requiredRole="admin">
            <Verifications />
          </ProtectedRoute>
        } />
        <Route path="verifications/:id" element={
          <ProtectedRoute requiredRole="admin">
            <VerificationDetail />
          </ProtectedRoute>
        } />
        <Route path="driver-verifications" element={
          <ProtectedRoute requiredRole="admin">
            <DriverVerifications />
          </ProtectedRoute>
        } />
        <Route path="driver-verifications/:id" element={
          <ProtectedRoute requiredRole="admin">
            <DriverDetail />
          </ProtectedRoute>
        } />
        
        {/* Business owner-only routes */}
        <Route path="products" element={
          <ProtectedRoute requiredRole="business_owner">
            <Products />
          </ProtectedRoute>
        } />
        <Route path="inventory" element={
          <ProtectedRoute requiredRole="business_owner">
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="business-profile" element={
          <ProtectedRoute requiredRole="business_owner">
            <BusinessProfile />
          </ProtectedRoute>
        } />
        
        {/* Common routes */}
        <Route path="orders" element={<Orders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;