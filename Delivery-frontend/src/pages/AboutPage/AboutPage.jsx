import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Truck, 
  Clock, 
  Star, 
  Globe,
  Shield,
  Leaf,
  Zap,
  MapPin,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Button, Card } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { formatCurrency } from '../../utils';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: Users, color: 'text-blue-600' },
    { label: 'Partner Restaurants', value: '1,200+', icon: Target, color: 'text-green-600' },
    { label: 'Cities Served', value: '15+', icon: MapPin, color: 'text-purple-600' },
    { label: 'Orders Delivered', value: '500,000+', icon: Truck, color: 'text-orange-600' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.',
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Fast delivery times and streamlined processes to get your food to you as quickly as possible.',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: Shield,
      title: 'Quality & Safety',
      description: 'Rigorous quality checks and safety standards to ensure the best food delivery experience.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and supporting local communities and businesses.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Globe,
      title: 'Innovation',
      description: 'Constantly improving our technology and services to provide cutting-edge solutions.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building strong relationships with restaurants, delivery partners, and local communities.',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/120/120',
      bio: 'Former tech executive with 15 years experience in scaling digital platforms.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/120/120',
      bio: 'Software engineer passionate about building reliable, scalable food delivery technology.'
    },
    {
      name: 'Fatima Ahmed',
      role: 'Head of Operations',
      image: '/api/placeholder/120/120',
      bio: 'Operations expert ensuring smooth delivery experiences across all our markets.'
    },
    {
      name: 'David Rodriguez',
      role: 'Head of Growth',
      image: '/api/placeholder/120/120',
      bio: 'Marketing strategist focused on sustainable growth and customer acquisition.'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'FastDrop was founded with a vision to revolutionize food delivery in Ethiopia.'
    },
    {
      year: '2021',
      title: 'First 100 Restaurants',
      description: 'Reached our first milestone of 100 partner restaurants in Addis Ababa.'
    },
    {
      year: '2022',
      title: 'Expansion',
      description: 'Expanded to 5 major cities across Ethiopia with 500+ restaurant partners.'
    },
    {
      year: '2023',
      title: 'Innovation Launch',
      description: 'Launched real-time tracking and advanced AI-powered recommendation system.'
    },
    {
      year: '2024',
      title: 'Regional Growth',
      description: 'Expanded to 15 cities with 1,200+ restaurants and 50,000+ active users.'
    }
  ];

  const achievements = [
    'Best Food Delivery App 2023',
    '99.5% Customer Satisfaction Rate',
    'Carbon Neutral Delivery Fleet',
    'ISO 27001 Security Certified',
    'Top Employer in Tech 2024'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              About FastDrop
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              We're on a mission to connect people with the food they love, 
              supporting local restaurants and creating opportunities for delivery partners across Ethiopia.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" leftIcon={<Heart className="h-5 w-5" />}>
                Join Our Mission
              </Button>
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow">
                    <Card.Content className="p-6">
                      <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-gray-600">{stat.label}</p>
                    </Card.Content>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Our Story */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  FastDrop was born from a simple observation: people in Ethiopia deserved better 
                  access to their favorite foods, and local restaurants needed a reliable platform 
                  to reach more customers.
                </p>
                <p>
                  Founded in 2020 by a team of tech enthusiasts and food lovers, we started with 
                  a vision to create the most reliable, fastest, and user-friendly food delivery 
                  platform in the region.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers daily, support over 1,200 
                  local restaurants, and provide income opportunities for hundreds of delivery partners 
                  across 15 cities in Ethiopia.
                </p>
                <p>
                  Our journey is just beginning. We're committed to continuous innovation, 
                  sustainable growth, and making a positive impact on the communities we serve.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg opacity-90 mb-6">
                  To make food delivery accessible, reliable, and enjoyable for everyone 
                  while empowering local businesses and creating sustainable livelihoods.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">25 min</div>
                    <div className="text-sm opacity-80">Average Delivery</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">4.8⭐</div>
                    <div className="text-sm opacity-80">Customer Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Our Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <Card.Content className="p-6 text-center">
                        <div className={`w-12 h-12 rounded-full ${value.color} flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-3">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </Card.Content>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-200"></div>
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                      <Card>
                        <Card.Content className="p-6">
                          <div className="text-sm text-orange-600 font-medium mb-2">{item.year}</div>
                          <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </Card.Content>
                      </Card>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow">
                    <Card.Content className="p-6">
                      <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                      <p className="text-sm text-gray-600">{member.bio}</p>
                    </Card.Content>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Recognition & Achievements</h2>
            <Card>
              <Card.Content className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{achievement}</span>
                    </motion.div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Card.Content className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Join the FastDrop Family</h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Whether you're a restaurant owner, delivery partner, or food lover, 
                  there's a place for you in our growing community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg">
                    Partner With Us
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600">
                    Become a Driver
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;