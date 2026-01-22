import { clsx } from 'clsx';
import { format, formatDistanceToNow, addMinutes } from 'date-fns';

// Class utility function
export function cn(...inputs) {
  return clsx(inputs);
}

// Format currency for Ethiopian Birr
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Ethiopian phone numbers
  if (cleaned.startsWith('251')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  } else if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    return `+251 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

// Format date
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  return format(new Date(date), formatString);
};

// Format relative time
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Calculate estimated delivery time
export const calculateDeliveryTime = (distance = 5) => {
  // Average delivery time: 5-7 minutes per km + 15 minutes preparation
  const prepTime = 15;
  const travelTime = Math.round(distance * 6);
  const totalMinutes = prepTime + travelTime;
  
  return {
    totalMinutes,
    estimatedTime: addMinutes(new Date(), totalMinutes),
    formattedTime: `${totalMinutes} minutes`
  };
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Ethiopian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+251|0)[79]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generate order tracking number
export const generateTrackingNumber = () => {
  const prefix = 'FD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-orange-100 text-orange-800 border-orange-200',
    ready: 'bg-purple-100 text-purple-800 border-purple-200',
    'out-for-delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || colors.pending;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return '';
  
  const { street, city, state, country } = address;
  return [street, city, state, country].filter(Boolean).join(', ');
};