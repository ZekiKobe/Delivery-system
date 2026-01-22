import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Package,
  Truck,
  Clock,
  MapPin,
  Check,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Button, Card } from '../ui';
import { useNotification } from '../../context';
import { formatRelativeTime } from '../../utils';

const NotificationCenter = ({ isOpen, onClose, position = 'dropdown' }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotification();

  // Auto-remove notifications with duration
  useEffect(() => {
    const timers = [];
    
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  const getNotificationIcon = (type) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      order: Package,
      delivery: Truck
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      error: 'text-red-600 bg-red-100',
      warning: 'text-yellow-600 bg-yellow-100',
      info: 'text-blue-600 bg-blue-100',
      order: 'text-orange-600 bg-orange-100',
      delivery: 'text-purple-600 bg-purple-100'
    };
    return colors[type] || colors.info;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle special notification types
    if (notification.type === 'order' || notification.type === 'delivery') {
      // Could navigate to order tracking page
      onClose?.();
    }
  };

  const renderNotificationItem = (notification) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);
    
    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
          !notification.read ? 'bg-blue-50' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          {/* Notification Icon */}
          <div className={`p-2 rounded-full flex-shrink-0 ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </p>
                <p className={`text-sm mt-1 ${
                  !notification.read ? 'text-gray-700' : 'text-gray-600'
                }`}>
                  {notification.message}
                </p>
                
                {/* Order/Delivery specific info */}
                {notification.orderId && (
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                    <span>Order #{notification.orderId}</span>
                    {notification.status && (
                      <span className="capitalize">{notification.status}</span>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>
              
              {/* Unread indicator */}
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEmptyState = () => (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
      <p className="text-sm text-gray-500">You're all caught up!</p>
    </div>
  );

  if (position === 'dropdown') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={onClose}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-xs text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {notifications.length > 0 ? (
                    notifications.map(notification => renderNotificationItem(notification))
                  ) : (
                    renderEmptyState()
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Full page mode
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </Card.Title>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:bg-red-50"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map(notification => renderNotificationItem(notification))
            ) : (
              renderEmptyState()
            )}
          </AnimatePresence>
        </Card.Content>
      </Card>
    </div>
  );
};

export default NotificationCenter;