import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, MapPin, Star, Smartphone, CreditCard } from 'lucide-react';
import { Card } from '../ui';

const Feature = () => {
  const features = [
    {
      icon: Clock,
      title: 'Lightning Fast Delivery',
      description: 'Get your orders delivered in 30 minutes or less with our optimized delivery network.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your payments are encrypted and your data is protected with bank-level security.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your order from business to your doorstep with live GPS tracking.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'Quality checks and verification ensure you receive the best products.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Smartphone,
      title: 'Easy to Use',
      description: 'Intuitive app design makes ordering as simple as a few taps on your phone.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Pay with cash, card, mobile money, or digital wallets - whatever works for you.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose FastDrop?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've reimagined delivery services to make it faster, safer, and more convenient 
            than ever before. Here's what makes us different.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card 
                  className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-white"
                  hover
                >
                  <Card.Content className="p-8">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-orange-100">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-orange-100">Business Partners</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">25 min</div>
              <div className="text-orange-100">Average Delivery</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">4.8★</div>
              <div className="text-orange-100">Customer Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Feature;