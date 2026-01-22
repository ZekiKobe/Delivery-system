import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const refreshToken = urlParams.get('refresh');
        const provider = urlParams.get('provider');
        const error = urlParams.get('error');

        if (error) {
          let errorMessage = 'OAuth authentication failed';
          switch (error) {
            case 'oauth_failed':
              errorMessage = 'Authentication with the provider failed';
              break;
            case 'oauth_callback_failed':
              errorMessage = 'Authentication completed but callback processing failed';
              break;
            case 'account_linking_failed':
              errorMessage = 'Failed to link your social account';
              break;
            default:
              errorMessage = `Authentication error: ${error}`;
          }
          
          setError(errorMessage);
          toast.error(errorMessage);
          
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (!token || !refreshToken) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        // Get user data using the token
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userData.data.user));
          
          // Update auth context
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: userData.data.user
          });

          // Show success message
          toast.success(`Successfully logged in with Google!`);

          // Check if user needs to complete profile
          if (!userData.data.user.phone || userData.data.user.phone === '' || userData.data.user.profileIncomplete) {
            toast.success('Please complete your profile by adding a phone number');
            navigate('/profile/complete');
          } else {
            navigate('/dashboard');
          }
        } else {
          throw new Error('Failed to fetch user data');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication processing failed');
        toast.error('Authentication failed. Please try again.');
        
        // Clean up any stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location, navigate, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallbackPage;