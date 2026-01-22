import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Verify token with backend
          const response = await authService.getCurrentUser();
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: response.data.user
            });
          } else {
            // Token is invalid, clear storage
            authService.logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.user
        });
        
        toast.success('Login successful!');
        return response.data.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        // Don't automatically log in the user - let the calling component handle navigation
        // dispatch({
        //   type: 'LOGIN_SUCCESS',
        //   payload: response.data.user
        // });
        
        toast.success('Registration successful! Please check your email to verify your account.');
        return response; // Return the full response instead of just user data
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      
      if (response?.success) {
        const updatedUser = { ...state.user, ...response.data.user };
        authService.updateStoredUser(updatedUser);
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: updatedUser
        });
        
        toast.success('Profile updated successfully');
        return updatedUser;
      } else {
        // Fallback to local update if service doesn't return expected format
        const updatedUser = { ...state.user, ...data };
        authService.updateStoredUser(updatedUser);
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: updatedUser
        });
        return updatedUser;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('Password reset link sent to your email');
        return response;
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        toast.success('Password reset successful. You can now login with your new password.');
        return response;
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      
      if (response.success) {
        // Update user email verification status
        const updatedUser = { ...state.user, isEmailVerified: true };
        authService.updateStoredUser(updatedUser);
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: { isEmailVerified: true }
        });
        
        toast.success('Email verified successfully!');
        return response;
      } else {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Email verification failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    ...state,
    dispatch, // Expose dispatch for special cases like OAuth callback
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};