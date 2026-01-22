import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageCircle, 
  Star, 
  User, 
  MapPin, 
  Clock,
  Navigation,
  Truck,
  Bike,
  Car
} from 'lucide-react';
import { Button, Card } from '../ui';
import { formatRelativeTime } from '../../utils';

const DeliveryPersonCard = ({ 
  deliveryPerson, 
  estimatedArrival, 
  distance,
  onCall,
  onMessage,
  showLocation = true,
  compact = false 
}) => {
  if (!deliveryPerson) return null;

  const getVehicleIcon = (vehicle) => {
    const icons = {
      'Motorcycle': Truck,
      'Bicycle': Bike,
      'Car': Car
    };
    const Icon = icons[vehicle] || Truck;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (available) => {
    return available ? 'bg-green-500' : 'bg-gray-400';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(deliveryPerson.available)} rounded-full border-2 border-white`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{deliveryPerson.name}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{deliveryPerson.rating}</span>
            </div>
            {deliveryPerson.vehicle && (
              <div className="flex items-center space-x-1">
                {getVehicleIcon(deliveryPerson.vehicle)}
                <span>{deliveryPerson.vehicle}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCall?.(deliveryPerson.phone)}
            className="p-2"
          >
            <Phone className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage?.(deliveryPerson.id)}
            className="p-2"
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <span>Your Delivery Person</span>
          {deliveryPerson.available && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(deliveryPerson.available)} rounded-full border-2 border-white`} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{deliveryPerson.name}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{deliveryPerson.rating}</span>
                  <span className="text-xs text-gray-500">(4.9/5)</span>
                </div>
                {deliveryPerson.vehicle && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    {getVehicleIcon(deliveryPerson.vehicle)}
                    <span>{deliveryPerson.vehicle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Information */}
          {estimatedArrival && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Estimated Arrival</span>
              </div>
              <p className="text-blue-900 font-semibold">
                {formatRelativeTime(estimatedArrival)}
              </p>
              {distance && (
                <p className="text-sm text-blue-600 mt-1">
                  {distance} km away
                </p>
              )}
            </div>
          )}

          {/* Location Status */}
          {showLocation && deliveryPerson.lastLocationUpdate && (
            <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Last seen {formatRelativeTime(deliveryPerson.lastLocationUpdate)}</span>
              <Navigation className="h-3 w-3 text-green-500" />
            </div>
          )}

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => onCall?.(deliveryPerson.phone)}
              leftIcon={<Phone className="h-4 w-4" />}
              className="w-full"
            >
              Call
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onMessage?.(deliveryPerson.id)}
              leftIcon={<MessageCircle className="h-4 w-4" />}
              className="w-full"
            >
              Message
            </Button>
          </div>

          {/* Additional Info */}
          {deliveryPerson.assignedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Assigned {formatRelativeTime(deliveryPerson.assignedAt)}
              </p>
            </div>
          )}
        </motion.div>
      </Card.Content>
    </Card>
  );
};

export default DeliveryPersonCard;