import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, MapPin, Truck, Loader, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Button, Input, Card } from '../../components/ui';
import { businessService } from '../../services';
import toast from 'react-hot-toast';

const BusinessesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const categories = [
    'all', 'restaurant', 'grocery', 'pharmacy', 'electronics', 'clothing', 
    'books', 'flowers', 'gifts', 'furniture', 'hardware', 'pet_supplies',
    'automotive', 'beauty', 'sports', 'toys', 'medical', 'laundry',
    'cleaning', 'catering', 'office_supplies', 'alcohol', 'convenience'
  ];

  
  // Get user location for nearby businesses
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          setLocationError('Unable to access location. Showing all businesses.');
          // Continue without location - just don't show nearby businesses
        },
        { 
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, []);



  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: sortBy,
        ...(userLocation && {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10
        })
      };

      const response = await businessService.getBusinesses(params);
      
      if (response.success) {
        setBusinesses(response.data.businesses || []);
      } else {
        toast.error(response.message || 'Failed to load businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      // Handle specific error cases
      if (error.message && error.message.includes('coordinates')) {
        toast.error('Invalid location data. Showing all businesses.');
        // Try again without location data
        try {
          const response = await businessService.getBusinesses({
            search: searchTerm || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sortBy: sortBy
          });
          
          if (response.success) {
            setBusinesses(response.data.businesses || []);
          } else {
            toast.error(response.message || 'Failed to load businesses');
          }
        } catch (retryError) {
          toast.error('Failed to load businesses');
        }
      } else {
        toast.error('Failed to load businesses');
      }
    } finally {
      setLoading(false);
    }
  };

    // Fetch businesses
    useEffect(() => {
      fetchBusinesses();
    }, [searchTerm, selectedCategory, sortBy, userLocation]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleBusinessClick = (businessId) => {
    navigate(`/business/${businessId}`);
  };

  const getCategoryDisplayName = (category) => {
    // Handle undefined, null, or empty values
    if (!category || typeof category !== 'string') {
      return 'Business';
    }
    
    const categoryMap = {
      'restaurant': 'Restaurant',
      'grocery': 'Grocery',
      'pharmacy': 'Pharmacy',
      'electronics': 'Electronics',
      'clothing': 'Clothing',
      'books': 'Books',
      'flowers': 'Flowers',
      'gifts': 'Gifts',
      'furniture': 'Furniture',
      'hardware': 'Hardware',
      'pet_supplies': 'Pet Supplies',
      'automotive': 'Automotive',
      'beauty': 'Beauty',
      'sports': 'Sports',
      'toys': 'Toys',
      'medical': 'Medical',
      'laundry': 'Laundry',
      'cleaning': 'Cleaning',
      'catering': 'Catering',
      'office_supplies': 'Office Supplies',
      'alcohol': 'Alcohol',
      'convenience': 'Convenience'
    };
    
    return categoryMap[category] || (category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '));
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Businesses
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Choose from hundreds of businesses and get your products delivered fast
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search businesses, categories, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-4 focus:ring-white/20 text-gray-900 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Location Error Message */}
      {locationError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">{locationError}</p>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : getCategoryDisplayName(category)}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-gray-600">
          {loading ? 'Loading businesses...' : `Showing ${businesses.length} businesses`}
        </p>
      </div>

      {/* Businesses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {businesses.map((business) => (
              <motion.div key={business.id || business._id} variants={itemVariants}>
                <Card 
                  className="h-full group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => handleBusinessClick(business.id || business._id)}
                >
                  {/* Business Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={business.images?.cover || business.images?.logo || `https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`}
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`;
                      }}
                    />
                    
                    {/* Featured Badge */}
                    {business.isFeatured && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold">{business.rating?.average?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{business.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getCategoryDisplayName(business.business_type || business.businessType)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {business.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{business.address?.city || 'Location'}</span>
                      </div>
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        <span>
                          {(business.delivery_info || business.deliveryInfo)?.estimated_delivery_time?.max || 
                           (business.delivery_info || business.deliveryInfo)?.estimatedDeliveryTime?.max || 
                           '30'} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{business.rating?.average?.toFixed(1) || '4.5'}</span>
                        <span className="text-gray-400 text-sm ml-1">({business.rating?.count || 0})</span>
                      </div>
                      <span className="font-semibold text-orange-600">
                        {(() => {
                          const deliveryInfo = business.delivery_info || business.deliveryInfo;
                          const fee = deliveryInfo?.delivery_fee || deliveryInfo?.deliveryFee || 0;
                          return fee > 0 ? formatCurrency(fee) : 'Free delivery';
                        })()}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BusinessesPage;