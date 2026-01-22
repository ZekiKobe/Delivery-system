import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  Home,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card } from '../ui';
import { formatRelativeTime } from '../../utils';

const OrderStatusTracker = ({ 
  order, 
  showEstimatedTimes = true,
  compact = false,
  animated = true 
}) => {
  if (!order) return null;

  const getStatusIcon = (stepId, completed) => {
    const icons = {
      1: Package,
      2: Clock,
      3: Truck,
      4: Home
    };
    const Icon = icons[stepId] || Package;
    
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-white" />;
    }
    
    return <Icon className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (completed, isCurrent) => {
    if (completed) return 'bg-green-500 border-green-500';
    if (isCurrent) return 'bg-orange-500 border-orange-500';
    return 'bg-gray-200 border-gray-300';
  };

  const getConnectorColor = (completed) => {
    return completed ? 'bg-green-500' : 'bg-gray-300';
  };

  const getCurrentStep = () => {
    const completedSteps = order.trackingSteps.filter(step => step.completed);
    return completedSteps.length;
  };

  const getStatusMessage = () => {
    const messages = {
      'confirmed': 'Order confirmed and sent to restaurant',
      'preparing': 'Restaurant is preparing your order',
      'ready': 'Order is ready for pickup',
      'out-for-delivery': 'Your order is on the way',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled'
    };
    return messages[order.status] || 'Processing your order';
  };

  const getProgressPercentage = () => {
    const currentStep = getCurrentStep();
    return (currentStep / order.trackingSteps.length) * 100;
  };

  if (compact) {
    return (
      <Card>
        <Card.Content className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(false, true)}`}>
                {getStatusIcon(getCurrentStep() + 1, false)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">
                {order.trackingSteps[getCurrentStep()]?.title || 'Processing'}
              </p>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Progress</div>
              <div className="text-sm font-medium text-orange-600">
                {Math.round(getProgressPercentage())}%
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
                className="bg-orange-500 h-1.5 rounded-full"
              />
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center justify-between">
          <span>Order Progress</span>
          <span className="text-sm font-normal text-gray-600">
            {Math.round(getProgressPercentage())}% Complete
          </span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          {/* Status Message */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-medium text-orange-800">
                {getStatusMessage()}
              </p>
            </div>
            {order.estimatedDelivery && (
              <p className="text-xs text-orange-600 mt-1">
                Estimated delivery: {formatRelativeTime(order.estimatedDelivery)}
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="relative">
            {order.trackingSteps.map((step, index) => {
              const isCompleted = step.completed;
              const isCurrent = !isCompleted && index === getCurrentStep();
              const isLast = index === order.trackingSteps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={animated ? { opacity: 0, x: -20 } : false}
                  animate={animated ? { opacity: 1, x: 0 } : false}
                  transition={animated ? { delay: index * 0.1 } : false}
                  className="relative flex items-start"
                >
                  {/* Connector Line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-12">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`w-full ${getConnectorColor(isCompleted)}`}
                      />
                      {!isCompleted && (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="flex items-start space-x-4 pb-8">
                    {/* Step Icon */}
                    <div className="flex-shrink-0">
                      <motion.div
                        initial={animated ? { scale: 0.8 } : false}
                        animate={animated ? { 
                          scale: isCurrent ? [1, 1.1, 1] : 1,
                          backgroundColor: isCompleted ? '#10b981' : isCurrent ? '#f97316' : '#e5e7eb'
                        } : false}
                        transition={animated ? { 
                          duration: isCurrent ? 1.5 : 0.3,
                          repeat: isCurrent ? Infinity : 0,
                          backgroundColor: { duration: 0.3 }
                        } : false}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStatusColor(isCompleted, isCurrent)}`}
                      >
                        {getStatusIcon(step.id, isCompleted)}
                      </motion.div>
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-orange-600' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                        {step.time && (
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(step.time)}
                          </span>
                        )}
                      </div>
                      
                      {/* Estimated Time */}
                      {showEstimatedTimes && !step.time && step.estimatedTime && (
                        <p className="text-sm text-gray-500 mt-1">
                          Expected: {formatRelativeTime(step.estimatedTime)}
                        </p>
                      )}

                      {/* Current Step Animation */}
                      <AnimatePresence>
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full"
                              />
                              <span className="text-xs text-orange-600 font-medium">
                                In Progress...
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Cancelled Status */}
          {order.status === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  Order Cancelled
                </p>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Your order has been cancelled and any payment will be refunded.
              </p>
            </motion.div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default OrderStatusTracker;