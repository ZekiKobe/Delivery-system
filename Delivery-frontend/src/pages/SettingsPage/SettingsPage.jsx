import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Edit3,
  Trash2,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context';
import { Button, Card, Input } from '../../components/ui';
import AddressManager from '../../components/AddressManager/AddressManager';
import PaymentManager from '../../components/PaymentManager/PaymentManager';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+251 91 234 5678',
    address: user?.address || '123 Main Street, Addis Ababa',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    smsNotifications: false,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareData: false,
    locationTracking: true,
    analyticsOptOut: false
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const handlePrivacyChange = (key) => {
    setPrivacy({
      ...privacy,
      [key]: !privacy[key]
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsMenu = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'preferences', label: 'App Preferences', icon: Globe }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-orange-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Personal Information</Card.Title>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              leftIcon={<Edit3 className="h-4 w-4" />}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveProfile}
                loading={loading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Change Password</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
            />
            <Button variant="outline" leftIcon={<Lock className="h-4 w-4" />}>
              Update Password
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <Card>
      <Card.Header>
        <Card.Title>Notification Preferences</Card.Title>
        <Card.Description>Choose how you want to receive updates</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-1">
          <ToggleSwitch
            checked={notifications.orderUpdates}
            onChange={() => handleNotificationChange('orderUpdates')}
            label="Order Updates"
            description="Get notified about order status changes"
          />
          <ToggleSwitch
            checked={notifications.promotions}
            onChange={() => handleNotificationChange('promotions')}
            label="Promotions & Offers"
            description="Receive special deals and discounts"
          />
          <ToggleSwitch
            checked={notifications.newsletter}
            onChange={() => handleNotificationChange('newsletter')}
            label="Newsletter"
            description="Weekly digest of new restaurants and features"
          />
          <ToggleSwitch
            checked={notifications.smsNotifications}
            onChange={() => handleNotificationChange('smsNotifications')}
            label="SMS Notifications"
            description="Receive text messages for important updates"
          />
          <ToggleSwitch
            checked={notifications.pushNotifications}
            onChange={() => handleNotificationChange('pushNotifications')}
            label="Push Notifications"
            description="Browser and mobile app notifications"
          />
        </div>
      </Card.Content>
    </Card>
  );

  const renderPrivacySecurity = () => (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Privacy Settings</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-1">
            <ToggleSwitch
              checked={privacy.showProfile}
              onChange={() => handlePrivacyChange('showProfile')}
              label="Public Profile"
              description="Allow others to see your profile information"
            />
            <ToggleSwitch
              checked={privacy.shareData}
              onChange={() => handlePrivacyChange('shareData')}
              label="Data Sharing"
              description="Share anonymous usage data to improve service"
            />
            <ToggleSwitch
              checked={privacy.locationTracking}
              onChange={() => handlePrivacyChange('locationTracking')}
              label="Location Tracking"
              description="Allow location tracking for better delivery service"
            />
            <ToggleSwitch
              checked={privacy.analyticsOptOut}
              onChange={() => handlePrivacyChange('analyticsOptOut')}
              label="Opt-out of Analytics"
              description="Disable analytics and tracking cookies"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Security Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              Two-Factor Authentication
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Login Activity
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Connected Apps
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="destructive" className="w-full justify-between">
              Delete Account
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderAddresses = () => (
    <AddressManager 
      onAddressChange={(addresses) => {
        console.log('Addresses updated:', addresses);
        // Here you would typically save to backend
      }}
    />
  );

  const renderPaymentMethods = () => (
    <PaymentManager 
      onPaymentChange={(methods) => {
        console.log('Payment methods updated:', methods);
        // Here you would typically save to backend
      }}
    />
  );

  const renderPreferences = () => (
    <Card>
      <Card.Header>
        <Card.Title>App Preferences</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
            </div>
            <ToggleSwitch
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
          </div>
          
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="or">Afaan Oromoo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="etb">Ethiopian Birr (ETB)</option>
              <option value="usd">US Dollar (USD)</option>
              <option value="eur">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSettings();
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacySecurity();
      case 'addresses':
        return renderAddresses();
      case 'payment':
        return renderPaymentMethods();
      case 'preferences':
        return renderPreferences();
      default:
        return renderAccountSettings();
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <Card.Content className="p-6">
                  <nav className="space-y-2">
                    {settingsMenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeSection === item.id
                              ? 'bg-orange-50 text-orange-600 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </Card.Content>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SettingsPage;