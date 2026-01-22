import React, { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon,
  PhotoIcon,
  DocumentIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import * as businessService from '../services/businessService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface BusinessData {
  _id: string;
  name: string;
  description: string;
  businessType: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  images: string[];
  documents: Array<{
    type: string;
    url: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
  }>;
  isVerified: boolean;
  verificationStatus: string;
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
}

const BusinessProfile: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessData>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      const response = await businessService.getBusinessProfile();
      setBusiness(response.data.business);
      setFormData(response.data.business);
    } catch (err) {
      console.error('Failed to fetch business profile:', err);
      setError('Failed to load business profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = new FormData();
      
      // Add basic data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' || key === 'documents') return;
        
        if (typeof value === 'object' && value !== null) {
          updateData.append(key, JSON.stringify(value));
        } else {
          updateData.append(key, String(value));
        }
      });

      // Add image files
      imageFiles.forEach(file => {
        updateData.append('images', file);
      });

      await businessService.updateBusinessProfile(updateData);
      
      // Upload documents separately if any
      if (documentFiles.length > 0) {
        const documentsData = new FormData();
        documentFiles.forEach(file => {
          documentsData.append('documents', file);
        });
        await businessService.uploadBusinessDocuments(documentsData);
      }

      setIsEditing(false);
      setImageFiles([]);
      setDocumentFiles([]);
      fetchBusinessProfile();
    } catch (err) {
      console.error('Failed to update business profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const updateOperatingHours = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours?.[day],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No business profile found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please contact support to set up your business profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business information and settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Verification Status */}
          <div className="flex items-center">
            {business.isVerified ? (
              <Badge variant="success" className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                Pending Verification
              </Badge>
            )}
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(business);
                  setImageFiles([]);
                  setDocumentFiles([]);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                {isEditing ? (
                  <select
                    value={formData.businessType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="grocery">Grocery</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="electronics">Electronics</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 capitalize">{business.businessType.replace('_', ' ')}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.address.street}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.address.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.address.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.address.zipCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address?.country || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value }
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.address.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Operating Hours
            </h2>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.operatingHours?.[day]?.isOpen || false}
                          onChange={(e) => updateOperatingHours(day, 'isOpen', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">Open</span>
                      </label>
                      
                      {formData.operatingHours?.[day]?.isOpen && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={formData.operatingHours[day]?.open || ''}
                            onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={formData.operatingHours[day]?.close || ''}
                            onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1">
                      {business.operatingHours[day]?.isOpen ? (
                        <span className="text-sm text-gray-900">
                          {business.operatingHours[day].open} - {business.operatingHours[day].close}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Closed</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Business Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
            
            {isEditing && (
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <PhotoIcon className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {business.images?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Business ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
              {imageFiles.map((file, index) => (
                <div key={`new-${index}`} className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">New Image</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Radius (km)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.deliveryRadius || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      deliveryRadius: parseInt(e.target.value)
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.deliveryRadius} km</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order ($)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumOrder || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      minimumOrder: parseFloat(e.target.value)
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">${business.minimumOrder}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee ($)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deliveryFee || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      deliveryFee: parseFloat(e.target.value)
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">${business.deliveryFee}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Time (minutes)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="15"
                    max="120"
                    value={formData.estimatedDeliveryTime || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      estimatedDeliveryTime: parseInt(e.target.value)
                    }))}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{business.estimatedDeliveryTime} min</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentIcon className="w-5 h-5 mr-2" />
              Documents
            </h2>
            
            {isEditing && (
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <DocumentIcon className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </label>
              </div>
            )}

            <div className="space-y-3">
              {business.documents?.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {doc.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      doc.status === 'verified' ? 'success' :
                      doc.status === 'rejected' ? 'danger' : 'warning'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
              
              {documentFiles.map((file, index) => (
                <div key={`new-doc-${index}`} className="flex items-center justify-between p-3 border border-dashed rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">New upload</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
