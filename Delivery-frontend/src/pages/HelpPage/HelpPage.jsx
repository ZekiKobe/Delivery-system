import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  Book, 
  Video, 
  MessageCircle, 
  Phone, 
  ChevronRight, 
  Star,
  Clock,
  Users,
  Truck,
  CreditCard,
  Shield,
  Settings,
  Play,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpCategories = [
    { id: 'all', label: 'All Topics', icon: Book },
    { id: 'orders', label: 'Orders & Tracking', icon: Truck },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'account', label: 'Account & Profile', icon: Users },
    { id: 'delivery', label: 'Delivery Issues', icon: Clock },
    { id: 'safety', label: 'Safety & Security', icon: Shield },
    { id: 'app', label: 'App & Technical', icon: Settings }
  ];

  const popularTopics = [
    {
      id: 1,
      title: 'How to track my order?',
      category: 'orders',
      views: 1234,
      helpful: 89,
      content: 'Learn how to track your order in real-time using our tracking system.',
      steps: [
        'Go to "My Orders" in your account',
        'Click on the order you want to track',
        'View real-time location of your delivery',
        'Get notifications for status updates'
      ]
    },
    {
      id: 2,
      title: 'How to cancel or modify an order?',
      category: 'orders',
      views: 956,
      helpful: 76,
      content: 'Steps to cancel or make changes to your order before preparation.',
      steps: [
        'Open your current order from "My Orders"',
        'Click "Modify" or "Cancel" button',
        'Confirm your changes within 5 minutes',
        'Receive confirmation of changes'
      ]
    },
    {
      id: 3,
      title: 'Payment methods and refunds',
      category: 'payments',
      views: 823,
      helpful: 92,
      content: 'Understanding payment options and refund policies.',
      steps: [
        'We accept cards, mobile money, and cash',
        'Refunds are processed within 3-5 business days',
        'Contact support for refund requests',
        'Keep receipts for verification'
      ]
    },
    {
      id: 4,
      title: 'Delivery time and areas',
      category: 'delivery',
      views: 712,
      helpful: 85,
      content: 'Information about delivery times and coverage areas.',
      steps: [
        'Check delivery area during restaurant selection',
        'Estimated times are shown at checkout',
        'Track real-time delivery progress',
        'Contact driver if needed'
      ]
    }
  ];

  const tutorials = [
    {
      title: 'Getting Started with FastDrop',
      duration: '3 min',
      type: 'video',
      description: 'Learn the basics of ordering food through our platform'
    },
    {
      title: 'Setting up your profile',
      duration: '2 min',
      type: 'guide',
      description: 'Complete your profile for better delivery experience'
    },
    {
      title: 'Using promo codes and discounts',
      duration: '1 min',
      type: 'video',
      description: 'Maximize savings with our promotional offers'
    },
    {
      title: 'Managing multiple addresses',
      duration: '2 min',
      type: 'guide',
      description: 'Add and manage delivery addresses easily'
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Chat with our support team instantly',
      icon: MessageCircle,
      action: 'Start Chat',
      available: true,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Call Support',
      description: '24/7 phone support available',
      icon: Phone,
      action: 'Call Now',
      available: true,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Report an Issue',
      description: 'Report problems with your order',
      icon: HelpCircle,
      action: 'Report Issue',
      available: true,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const filteredTopics = popularTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const HelpArticle = ({ topic }) => (
    <Card className="hover:shadow-md transition-shadow">
      <Card.Content className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{topic.content}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        <div className="space-y-2 mb-4">
          {topic.steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
          <span>{topic.views} views</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span>{topic.helpful}% helpful</span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to your questions and get the support you need
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help topics, guides, or issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <Card.Content className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                      <Button 
                        className={action.color}
                        size="sm"
                      >
                        {action.action}
                      </Button>
                    </Card.Content>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <Card.Header>
                  <Card.Title>Browse by Category</Card.Title>
                </Card.Header>
                <Card.Content>
                  <nav className="space-y-2">
                    {helpCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-orange-50 text-orange-600 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </Card.Content>
              </Card>

              {/* Tutorials */}
              <Card className="mt-6">
                <Card.Header>
                  <Card.Title>Video Tutorials</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {tutorials.map((tutorial, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {tutorial.type === 'video' ? (
                            <Play className="h-5 w-5 text-orange-600" />
                          ) : (
                            <Book className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{tutorial.title}</h4>
                          <p className="text-xs text-gray-600">{tutorial.duration} • {tutorial.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Tutorials
                  </Button>
                </Card.Content>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'Popular Topics' : helpCategories.find(c => c.id === selectedCategory)?.label}
                </h2>
                <span className="text-gray-600">
                  {filteredTopics.length} article{filteredTopics.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Help Articles */}
              {filteredTopics.length === 0 ? (
                <Card>
                  <Card.Content className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery ? 'Try adjusting your search terms' : 'No articles available in this category'}
                    </p>
                    <Button onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </Card.Content>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <HelpArticle topic={topic} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Additional Resources */}
              <Card className="mt-8">
                <Card.Header>
                  <Card.Title>Additional Resources</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Download className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">User Manual</h4>
                        <p className="text-sm text-gray-600">Complete guide to using FastDrop</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Video className="h-8 w-8 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Video Library</h4>
                        <p className="text-sm text-gray-600">Step-by-step video tutorials</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Still Need Help */}
              <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <Card.Content className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
                  <p className="text-gray-600 mb-6">
                    Can't find what you're looking for? Our support team is here to help you 24/7.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button leftIcon={<MessageCircle className="h-4 w-4" />}>
                      Live Chat
                    </Button>
                    <Button variant="outline" leftIcon={<Phone className="h-4 w-4" />}>
                      Call Support
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpPage;