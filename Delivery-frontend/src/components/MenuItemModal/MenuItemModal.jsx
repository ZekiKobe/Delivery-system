import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Minus, 
  DollarSign,
  Clock,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { businessDashboardService } from '../../services';
import toast from 'react-hot-toast';

const MenuItemModal = ({ 
  isOpen, 
  onClose, 
  menuItem = null, 
  onSave,
  onBusinessSetupRequired
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    preparationTime: 15,
    images: [],
    ingredients: [''],
    allergens: [],
    dietary: [],
    isSpicy: false,
    spiceLevel: 0,
    tags: [''],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: ''
    },
    modifierGroups: []
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);

  // Allergen options
  const allergenOptions = [
    'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 'fish', 'sesame'
  ];

  // Dietary options
  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free'
  ];

  // Initialize form when modal opens or menuItem changes
  useEffect(() => {
    if (isOpen) {
      if (menuItem) {
        // Edit mode - populate form with existing data
        setFormData({
          name: menuItem.name || '',
          description: menuItem.description || '',
          price: menuItem.price?.toString() || '',
          originalPrice: menuItem.originalPrice?.toString() || '',
          category: menuItem.category || '',
          preparationTime: menuItem.preparationTime || 15,
          images: menuItem.images || [],
          ingredients: menuItem.ingredients?.length > 0 ? menuItem.ingredients : [''],
          allergens: menuItem.allergens || [],
          dietary: menuItem.dietary || [],
          isSpicy: menuItem.isSpicy || false,
          spiceLevel: menuItem.spiceLevel || 0,
          tags: menuItem.tags?.length > 0 ? menuItem.tags : [''],
          nutrition: {
            calories: menuItem.nutrition?.calories?.toString() || '',
            protein: menuItem.nutrition?.protein?.toString() || '',
            carbs: menuItem.nutrition?.carbs?.toString() || '',
            fat: menuItem.nutrition?.fat?.toString() || '',
            fiber: menuItem.nutrition?.fiber?.toString() || '',
            sugar: menuItem.nutrition?.sugar?.toString() || '',
            sodium: menuItem.nutrition?.sodium?.toString() || ''
          },
          modifierGroups: menuItem.modifierGroups || []
        });
        setImagePreview(menuItem.images || []);
      } else {
        // Create mode - reset form
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, menuItem]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      preparationTime: 15,
      images: [],
      ingredients: [''],
      allergens: [],
      dietary: [],
      isSpicy: false,
      spiceLevel: 0,
      tags: [''],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: ''
      },
      modifierGroups: []
    });
    setImagePreview([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (8MB limit)
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 8MB`);
        }

        const response = await businessDashboardService.uploadMenuImage(file);
        if (response.success) {
          
          // Return the URL of the uploaded image
          return response.data.images[0].url;
        } else {
          console.log(response);
          throw new Error(response.message || 'Upload failed');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      setImagePreview(prev => [...prev, ...uploadedUrls]);
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Check if this is a business setup error
      if (error.message && error.message.includes('Business not found')) {
        toast.error('Please complete your business setup before uploading menu images');
        // Notify parent component that business setup is required
        if (onBusinessSetupRequired) {
          onBusinessSetupRequired();
        }
      } else {
        toast.error(error.message || 'Failed to upload images');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Menu item name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (formData.preparationTime < 5) {
      newErrors.preparationTime = 'Preparation time must be at least 5 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        ingredients: formData.ingredients.filter(item => item.trim() !== ''),
        tags: formData.tags.filter(item => item.trim() !== ''),
        nutrition: Object.fromEntries(
          Object.entries(formData.nutrition).map(([key, value]) => [
            key,
            value ? parseFloat(value) : undefined
          ])
        )
      };

      let response;
      if (menuItem) {
        // Update existing item
        response = await businessDashboardService.updateMenuItem(menuItem._id, apiData);
      } else {
        // Create new item
        response = await businessDashboardService.createMenuItem(apiData);
      }

      if (response.success) {
        toast.success(response.message);
        onSave(response.data.menuItem);
        onClose();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <Card.Header>
                <Card.Title>Basic Information</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Item Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="e.g., Margherita Pizza"
                  />
                  <Input
                    label="Category *"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    error={errors.category}
                    placeholder="e.g., Pizza, Burgers, Salads"
                  />
                </div>

                <Input
                  label="Description *"
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  placeholder="Describe your menu item..."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Price *"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    error={errors.price}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    placeholder="0.00"
                  />
                  <Input
                    label="Original Price (Optional)"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    placeholder="0.00"
                  />
                  <Input
                    label="Preparation Time (min) *"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value))}
                    error={errors.preparationTime}
                    leftIcon={<Clock className="h-4 w-4" />}
                    min="5"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* Images */}
            <Card>
              <Card.Header>
                <Card.Title>Images *</Card.Title>
              </Card.Header>
              <Card.Content>
                {errors.images && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{errors.images}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload images or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 8MB each
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Image Preview */}
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreview.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Ingredients and Tags */}
            <Card>
              <Card.Header>
                <Card.Title>Ingredients & Tags</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => handleArrayInputChange('ingredients', index, e.target.value)}
                        placeholder="e.g., Tomato sauce, Mozzarella"
                        className="flex-1"
                      />
                      {formData.ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('ingredients', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('ingredients')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Ingredient
                  </Button>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <Input
                        value={tag}
                        onChange={(e) => handleArrayInputChange('tags', index, e.target.value)}
                        placeholder="e.g., Popular, Spicy, Chef's Special"
                        className="flex-1"
                      />
                      {formData.tags.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('tags', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('tags')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Tag
                  </Button>
                </div>
              </Card.Content>
            </Card>

            {/* Dietary Information */}
            <Card>
              <Card.Header>
                <Card.Title>Dietary Information</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                {/* Allergens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contains Allergens
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allergenOptions.map(allergen => (
                      <label key={allergen} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.allergens.includes(allergen)}
                          onChange={() => handleCheckboxChange('allergens', allergen)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm capitalize">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dietary Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Options
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dietaryOptions.map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.dietary.includes(option)}
                          onChange={() => handleCheckboxChange('dietary', option)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm capitalize">{option.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Spice Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spice Level
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isSpicy}
                        onChange={(e) => handleInputChange('isSpicy', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm">Spicy</span>
                    </label>
                    {formData.isSpicy && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Level:</span>
                        <select
                          value={formData.spiceLevel}
                          onChange={(e) => handleInputChange('spiceLevel', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {[0, 1, 2, 3, 4, 5].map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${i < formData.spiceLevel ? 'bg-red-500' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Nutrition Information */}
            <Card>
              <Card.Header>
                <Card.Title>Nutrition Information (per serving)</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Calories"
                    type="number"
                    value={formData.nutrition.calories}
                    onChange={(e) => handleNestedInputChange('nutrition', 'calories', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    step="0.1"
                    value={formData.nutrition.protein}
                    onChange={(e) => handleNestedInputChange('nutrition', 'protein', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Carbs (g)"
                    type="number"
                    step="0.1"
                    value={formData.nutrition.carbs}
                    onChange={(e) => handleNestedInputChange('nutrition', 'carbs', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Fat (g)"
                    type="number"
                    step="0.1"
                    value={formData.nutrition.fat}
                    onChange={(e) => handleNestedInputChange('nutrition', 'fat', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Fiber (g)"
                    type="number"
                    step="0.1"
                    value={formData.nutrition.fiber}
                    onChange={(e) => handleNestedInputChange('nutrition', 'fiber', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Sugar (g)"
                    type="number"
                    step="0.1"
                    value={formData.nutrition.sugar}
                    onChange={(e) => handleNestedInputChange('nutrition', 'sugar', e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Sodium (mg)"
                    type="number"
                    value={formData.nutrition.sodium}
                    onChange={(e) => handleNestedInputChange('nutrition', 'sodium', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftIcon={menuItem ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              >
                {menuItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenuItemModal;