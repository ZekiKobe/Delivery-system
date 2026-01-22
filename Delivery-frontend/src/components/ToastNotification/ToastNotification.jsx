import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X,
  Package,
  Truck,
  Bell
} from 'lucide-react';
import { Button } from '../ui';

const ToastNotification = ({ 
  notification, 
  onClose, 
  position = 'top-right',
  autoClose = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose && notification.duration > 0) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration / 100));
          return Math.max(0, newProgress);
        });
      }, 100);

      // Auto close timer
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for exit animation
      }, notification.duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [notification.duration, autoClose, onClose]);

  const getIcon = (type) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      order: Package,
      delivery: Truck,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  const getColors = (type) => {
    const colors = {
      success: {
        bg: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        text: 'text-green-800',
        progress: 'bg-green-500'
      },
      error: {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        text: 'text-red-800',
        progress: 'bg-red-500'
      },
      warning: {
        bg: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        text: 'text-yellow-800',
        progress: 'bg-yellow-500'
      },
      info: {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-800',
        progress: 'bg-blue-500'
      },
      order: {
        bg: 'bg-orange-50 border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-800',
        progress: 'bg-orange-500'
      },
      delivery: {
        bg: 'bg-purple-50 border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-800',
        progress: 'bg-purple-500'
      }
    };
    return colors[type] || colors.info;
  };

  const getPositionClasses = (position) => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  const getAnimationVariants = (position) => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isLeft = position.includes('left');
    
    return {
      initial: {
        opacity: 0,
        scale: 0.8,
        x: isRight ? 100 : isLeft ? -100 : 0,
        y: isTop ? -50 : 50
      },
      animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        x: isRight ? 100 : isLeft ? -100 : 0,
        y: isTop ? -50 : 50
      }
    };
  };

  const Icon = getIcon(notification.type);
  const colors = getColors(notification.type);
  const positionClasses = getPositionClasses(position);
  const variants = getAnimationVariants(position);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed z-50 ${positionClasses}`}
        >
          <div className={`relative w-72 sm:w-80 lg:w-96 max-w-[calc(100vw-2rem)] border rounded-lg shadow-lg ${colors.bg} overflow-hidden mx-4 sm:mx-0`}>
            {/* Progress bar */}
            {autoClose && notification.duration > 0 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <motion.div
                  className={`h-full ${colors.progress}`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <p className={`text-sm font-medium ${colors.text} mb-1`}>
                      {notification.title}
                    </p>
                  )}
                  <p className={`text-sm ${colors.text}`}>
                    {notification.message}
                  </p>

                  {/* Additional info for order/delivery notifications */}
                  {(notification.type === 'order' || notification.type === 'delivery') && notification.orderId && (
                    <p className="text-xs text-gray-600 mt-2">
                      Order #{notification.orderId}
                      {notification.status && ` • ${notification.status}`}
                    </p>
                  )}

                  {/* Action buttons for interactive notifications */}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="mt-3 flex space-x-2">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.variant || 'outline'}
                          onClick={() => {
                            action.onClick?.();
                            if (action.closeOnClick !== false) {
                              handleClose();
                            }
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close button */}
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="p-1 h-6 w-6 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ 
  notifications = [], 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    // Only show notifications with duration (toast-style notifications)
    const toastNotifications = notifications
      .filter(n => n.duration > 0)
      .slice(0, maxToasts);
    
    setActiveToasts(toastNotifications);
  }, [notifications, maxToasts]);

  const handleRemoveToast = (notificationId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== notificationId));
  };

  const getContainerStyles = (position) => {
    const baseStyles = "fixed z-50 pointer-events-none";
    const positions = {
      'top-right': `${baseStyles} top-4 right-4`,
      'top-left': `${baseStyles} top-4 left-4`,
      'top-center': `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`,
      'bottom-right': `${baseStyles} bottom-4 right-4`,
      'bottom-left': `${baseStyles} bottom-4 left-4`,
      'bottom-center': `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`
    };
    return positions[position] || positions['top-right'];
  };

  return (
    <div className={getContainerStyles(position)}>
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence>
          {activeToasts.map((notification, index) => (
            <motion.div
              key={notification.id}
              layout
              style={{ zIndex: 1000 - index }}
            >
              <ToastNotification
                notification={notification}
                position={position}
                onClose={() => handleRemoveToast(notification.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastNotification;