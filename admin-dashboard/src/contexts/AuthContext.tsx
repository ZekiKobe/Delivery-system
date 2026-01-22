import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/adminService';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business_owner' | 'customer';
  business?: {
    _id: string;
    name: string;
    businessType: string;
    isVerified: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isBusinessOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getCurrentUser();
    const token = localStorage.getItem('adminToken');
    
    if (storedUser && token) {
      // Ensure _id exists (map id to _id if needed)
      const userWithId = {
        ...storedUser,
        _id: storedUser._id || storedUser.id?.toString() || storedUser._id
      };
      setUser(userWithId);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    logout();
  };

  const isAdmin = user?.role === 'admin';
  const isBusinessOwner = user?.role === 'business_owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAdmin,
        isBusinessOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
