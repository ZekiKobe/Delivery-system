import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context';
import { Button, Input, Card } from '../../components/ui';
import { isValidEmail } from '../../utils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
      setErrors({ password: 'Invalid email or password' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <Card.Content className="p-6 sm:p-8">
              {/* Logo and Header */}
              <div className="text-center mb-6 sm:mb-8">
                <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 sm:p-3 rounded-xl">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    FastDrop
                  </span>
                </Link>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Sign in to your account to continue ordering
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  leftIcon={<Mail className="h-5 w-5" />}
                  className="text-base"
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  className="text-base"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  
                  <Link
                    to="/forgot-password"
                    className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full text-base sm:text-lg py-2.5 sm:py-3"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 sm:my-8 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500 bg-white">Or continue with</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Social Login */}
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base"
                  onClick={async () => {
                    try {
                      const googleAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/oauth/google`;
                      // Check if OAuth is available
                      const response = await fetch(googleAuthUrl, { method: 'HEAD' });
                      if (response.status === 501) {
                        toast.error('Google login is not configured yet. Please contact administrator.');
                        return;
                      }
                      window.location.href = googleAuthUrl;
                    } catch (error) {
                      toast.error('Google login temporarily unavailable');
                    }
                  }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Continue with Google
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
        
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 sm:mt-6"
        >
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-1 text-sm"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;