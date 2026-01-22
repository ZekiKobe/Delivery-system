import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileCompletePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
      await updateProfile({
        phone: formData.phone.trim(),
        profileIncomplete: false,
        isPhoneVerified: false // Will need verification later
      });
      
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping but keep profile incomplete
    toast.success('You can complete your profile later in settings');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <Card.Content className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Complete Your Profile
                </h1>
                <p className="text-gray-600">
                  Welcome, {user?.firstName}! Please add your phone number to complete your profile.
                </p>
              </div>

              {/* Why Phone Number */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Why do we need your phone number?</p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-1">
                      <li>• Order updates and delivery notifications</li>
                      <li>• Contact you if there are delivery issues</li>
                      <li>• Account security and verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  leftIcon={<Phone className="h-5 w-5" />}
                  className="text-base"
                  autoFocus
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    loading={loading}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    className="w-full text-lg py-3"
                  >
                    {loading ? 'Completing Profile...' : 'Complete Profile'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="w-full"
                    disabled={loading}
                  >
                    Skip for now
                  </Button>
                </div>
              </form>

              {/* Security Note */}
              <div className="mt-6 text-center text-xs text-gray-500">
                Your phone number is kept private and secure. 
                We'll never share it with third parties.
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileCompletePage;