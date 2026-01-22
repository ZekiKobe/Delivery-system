import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Clock, 
  MapPin, 
  ShoppingCart, 
  Filter,
  Search,
  Heart,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { businessService } from '../../services';
import { ecommerceService } from '../../services/ecommerceService';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [business, setBusiness] = useState(null);
  const [menuData, setMenuData] = useState({ categories: [], menuItems: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusinessAndMenu();
    }
  }, [businessId]);

  const fetchBusinessAndMenu = async () => {
    try {
      setLoading(true);
      const [businessResponse, productsResponse] = await Promise.all([
        businessService.getBusiness(businessId),
        businessService.getBusinessProducts(businessId)
      ]);

      if (businessResponse.success) {
        setBusiness(businessResponse.data.business);
      }

      if (productsResponse.success) {
        setMenuData({
          categories: productsResponse.data.categories || [],
          menuItems: productsResponse.data.menuItems || []
        });
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const categories = ['all', ...menuData.categories.map(cat => cat.name)];

  const filteredItems = menuData.menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrderOnEcommerce = (item = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to order');
      navigate('/login');
      return;
    }

    if (!business) {
      toast.error('Business information not available');
      return;
    }

    // Redirect to ecommerce with business and product info
    const ecommerceUrl = ecommerceService.getProductUrl(business.id || business._id, item ? (item.id || item._id) : null);
    window.location.href = ecommerceUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business not found</h2>
          <Button onClick={() => navigate('/businesses')}>Back to Businesses</Button>
        </div>
        <Footer />
      </div>
    );
  }

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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/businesses')}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Businesses
              </Button>
              {business && (
                <Button 
                  onClick={() => handleOrderOnEcommerce()}
                  leftIcon={<ShoppingCart className="h-4 w-4" />}
                >
                  View All Products on Ecommerce
                </Button>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-48 md:h-full overflow-hidden">
                    <img
                      src={business.images?.cover || business.images?.logo || `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500`}
                      alt={business.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500`;
                      }}
                    />
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                      <p className="text-gray-600 mb-4">{business.description}</p>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Heart className="h-4 w-4" />}>
                      Save
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{business.rating?.average?.toFixed(1) || '4.5'}</span>
                      <span>({business.rating?.count || 0} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {(() => {
                          const deliveryInfo = business.delivery_info || business.deliveryInfo;
                          const time = deliveryInfo?.estimated_delivery_time || deliveryInfo?.estimatedDeliveryTime;
                          return time ? `${time.min || 25}-${time.max || 35} min` : '25-35 min';
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{business.address?.city || 'City'}, {business.address?.state || 'State'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-4 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Delivery fee: {formatCurrency((business.delivery_info || business.deliveryInfo)?.delivery_fee || (business.delivery_info || business.deliveryInfo)?.deliveryFee || 0)}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Min order: {formatCurrency((business.delivery_info || business.deliveryInfo)?.minimum_order || (business.delivery_info || business.deliveryInfo)?.minimumOrder || 0)}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      business.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {business.is_active ? 'Open now' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters & Search */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <Card.Header>
                  <Card.Title>Menu</Card.Title>
                </Card.Header>
                <Card.Content>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? 'bg-orange-50 text-orange-600 border border-orange-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {category === 'all' ? 'All Items' : category}
                      </button>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredItems.map((item, index) => {
                  const itemId = item.id || item._id;
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400`;
                              }}
                            />
                          </div>
                          {item.is_popular && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Popular
                            </div>
                          )}
                          {item.is_spicy && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                              🌶️ Spicy
                            </div>
                          )}
                        </div>
                        
                        <Card.Content className="p-4">
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <p className="text-xl font-bold text-orange-600">{formatCurrency(item.price)}</p>
                          </div>
                          
                          <Button
                            className="w-full"
                            onClick={() => handleOrderOnEcommerce(item)}
                            leftIcon={<ShoppingCart className="h-4 w-4" />}
                          >
                            Order Now
                          </Button>
                        </Card.Content>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default MenuPage;