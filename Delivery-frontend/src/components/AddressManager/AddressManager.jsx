import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Home, 
  Briefcase, 
  MapPin as LocationIcon,
  Save,
  X,
  Check,
  Star,
  Clock
} from 'lucide-react';
import { Button, Card, Input } from '../ui';

const AddressManager = ({ addresses: initialAddresses = [], onAddressChange }) => {
  const [addresses, setAddresses] = useState(initialAddresses.length > 0 ? initialAddresses : [
    {
      id: '1',
      label: 'Home',
      street: '123 Main Street',
      area: 'Bole',
      city: 'Addis Ababa',
      phone: '+251 91 234 5678',
      instructions: 'Second floor, blue door',
      isDefault: true,
      type: 'home',
      coordinates: { lat: 9.0192, lng: 38.7525 },
      isVerified: true,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      label: 'Office',
      street: '456 Business Ave',
      area: 'Kazanchis',
      city: 'Addis Ababa',
      phone: '+251 91 345 6789',
      instructions: 'Reception on ground floor',
      isDefault: false,
      type: 'work',
      coordinates: { lat: 9.0250, lng: 38.7580 },
      isVerified: true,
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    area: '',
    city: 'Addis Ababa',
    phone: '',
    instructions: '',
    type: 'home'
  });

  const [errors, setErrors] = useState({});

  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'other', label: 'Other', icon: LocationIcon }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.label.trim()) newErrors.label = 'Address label is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+251\s?9[0-9]\s?\d{3}\s?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Ethiopian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAddress = {
      id: editingAddress ? editingAddress.id : Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0, // First address is default
      coordinates: { lat: 9.0192 + Math.random() * 0.01, lng: 38.7525 + Math.random() * 0.01 },
      isVerified: false,
      lastUsed: new Date().toISOString()
    };

    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...newAddress, isDefault: addr.isDefault } : addr
      ));
    } else {
      setAddresses(prev => [...prev, newAddress]);
    }

    // Reset form
    setFormData({
      label: '',
      street: '',
      area: '',
      city: 'Addis Ababa',
      phone: '',
      instructions: '',
      type: 'home'
    });
    
    setShowAddForm(false);
    setEditingAddress(null);
    setIsSubmitting(false);
    
    onAddressChange?.(addresses);
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      street: address.street,
      area: address.area,
      city: address.city,
      phone: address.phone,
      instructions: address.instructions || '',
      type: address.type
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => {
        const remaining = prev.filter(addr => addr.id !== addressId);
        // If we deleted the default address, make the first remaining address default
        if (remaining.length > 0 && prev.find(addr => addr.id === addressId)?.isDefault) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
      onAddressChange?.(addresses);
    }
  };

  const handleSetDefault = (addressId) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    onAddressChange?.(addresses);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      street: '',
      area: '',
      city: 'Addis Ababa',
      phone: '',
      instructions: '',
      type: 'home'
    });
    setErrors({});
  };

  const getTypeIcon = (type) => {
    const typeConfig = addressTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : LocationIcon;
  };

  const formatLastUsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
          <p className="text-sm text-gray-600">Manage your delivery addresses</p>
        </div>
        <Button 
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Address
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-orange-200 bg-orange-50/30">
              <Card.Header>
                <div className="flex justify-between items-center">
                  <Card.Title>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </Card.Title>
                  <Button variant="ghost" size="sm" onClick={cancelForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Address Label"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      error={errors.label}
                      placeholder="e.g., Home, Office, Mom's House"
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {addressTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                              className={`p-3 border rounded-lg text-center transition-all ${
                                formData.type === type.value
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Icon className={`h-5 w-5 mx-auto mb-1 ${
                                formData.type === type.value ? 'text-orange-600' : 'text-gray-600'
                              }`} />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    error={errors.street}
                    placeholder="House number and street name"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Area/Subcity"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      error={errors.area}
                      placeholder="e.g., Bole, Kirkos, Arada"
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="Addis Ababa">Addis Ababa</option>
                        <option value="Dire Dawa">Dire Dawa</option>
                        <option value="Bahir Dar">Bahir Dar</option>
                        <option value="Hawassa">Hawassa</option>
                        <option value="Mekelle">Mekelle</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    placeholder="+251 9X XXX XXXX"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      placeholder="Any specific instructions for delivery (e.g., gate code, floor number, landmarks)"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={cancelForm}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={isSubmitting}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <Card>
            <Card.Content className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-4">Add your first address to start ordering</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Address
              </Button>
            </Card.Content>
          </Card>
        ) : (
          addresses.map((address, index) => {
            const TypeIcon = getTypeIcon(address.type);
            return (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${address.isDefault ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                  <Card.Content className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${address.isDefault ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <TypeIcon className={`h-5 w-5 ${address.isDefault ? 'text-orange-600' : 'text-gray-600'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{address.label}</h4>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                            {address.isVerified && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-1">
                            {address.street}, {address.area}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">{address.city}</p>
                          
                          {address.instructions && (
                            <p className="text-gray-600 text-sm mb-2 italic">
                              "{address.instructions}"
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📞 {address.phone}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Last used {formatLastUsed(address.lastUsed)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {!address.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(address.id)}
                            leftIcon={<Star className="h-3 w-3" />}
                          >
                            Set Default
                          </Button>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(address)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(address.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AddressManager;