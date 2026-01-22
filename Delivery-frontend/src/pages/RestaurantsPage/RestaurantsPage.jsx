import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, MapPin, Truck, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Button, Input, Card } from '../../components/ui';
import { restaurantService } from '../../services';
import toast from 'react-hot-toast';

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const cuisines = ['all', 'Ethiopian', 'Italian', 'American', 'Asian', 'Mediterranean', 'Fast Food'];

  // Get user location for nearby restaurants
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          // Continue without location - just don't show nearby restaurants
          // This is not a critical error, so we don't need to show it to users
        },
        { 
          enableHighAccuracy: false, // Less strict for better compatibility
          timeout: 10000, // 10 second timeout
          maximumAge: 300000 // 5 minute cache
        }
      );
    }
  }, []);

  // Fetch restaurants
  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, selectedCuisine, sortBy, userLocation]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        cuisine: selectedCuisine !== 'all' ? selectedCuisine : undefined,
        sortBy: sortBy,
        ...(userLocation && {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10
        })
      };

      const response = await restaurantService.getRestaurants(params);
      
      if (response.success) {
        setRestaurants(response.data.restaurants || []);
      } else {
        toast.error('Failed to load restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
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

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
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
              Discover Amazing Food
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Choose from hundreds of restaurants and get your meal delivered fast
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, or dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-4 focus:ring-white/20 text-gray-900 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Cuisine Filter */}
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCuisine === cuisine
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine === 'all' ? 'All Cuisines' : cuisine}
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
          {loading ? 'Loading restaurants...' : `Showing ${restaurants.length} restaurants`}
        </p>
      </div>

      {/* Restaurants Grid */}
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
            {restaurants.map((restaurant) => (
              <motion.div key={restaurant._id} variants={itemVariants}>
                <Card 
                  className="h-full group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => handleRestaurantClick(restaurant._id)}
                >
                  {/* Restaurant Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.images?.cover || restaurant.images?.logo || `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`;
                      }}
                    />
                    
                    {/* Featured Badge */}
                    {restaurant.isFeatured && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold">{restaurant.rating?.average?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <Card.Content className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-600">{restaurant.cuisineType?.join(', ') || 'Various Cuisines'}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.deliveryInfo?.estimatedDeliveryTime ? `${restaurant.deliveryInfo.estimatedDeliveryTime.min}-${restaurant.deliveryInfo.estimatedDeliveryTime.max} min` : '25-35 min'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Truck className="h-4 w-4" />
                          <span>{formatCurrency(restaurant.deliveryInfo?.deliveryFee || 0)}</span>
                        </div>
                      </div>

                      {/* Minimum Order */}
                      <div className="text-sm text-gray-600">
                        Min. order: {formatCurrency(restaurant.deliveryInfo?.minimumOrder || 0)}
                      </div>

                      {/* Status */}
                      <div className="text-sm">
                        {restaurant.isCurrentlyOpen ? (
                          <span className="text-green-600 font-medium">Open now</span>
                        ) : (
                          <span className="text-red-600 font-medium">Closed</span>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button className="w-full mt-4">
                        View Menu
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;