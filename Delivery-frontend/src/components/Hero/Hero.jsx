import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../context';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const stats = [
    { icon: Star, value: '4.8', label: 'Average Rating' },
    { icon: Clock, value: '25 min', label: 'Delivery Time' },
    { icon: Shield, value: '100%', label: 'Secure Payment' }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/businesses');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium"
            >
              <Star className="h-4 w-4 fill-current" />
              <span>Ethiopia's #1 Delivery Service</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fast, Reliable
                <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Delivery Service
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get your favorite products delivered fast and fresh to your doorstep. 
                From restaurants to retail stores, all in one place.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="text-lg px-8 py-4"
              >
                {isAuthenticated ? 'Order Now' : 'Get Started'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Play className="h-5 w-5" />}
                className="text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mx-auto mb-2">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl rotate-6 opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <img
                  src="bg_cover2.png"
                  alt="Fast delivery service"
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Fast Delivery</div>
                  <div className="text-xs text-gray-600">Within 30 minutes</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-orange-600 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Top Rated</div>
                  <div className="text-xs text-gray-600">4.8/5 rating</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <span className="text-sm">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;