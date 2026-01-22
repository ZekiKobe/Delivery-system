import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getUserById,
  updateUser
} from '../services/adminService';
import type { User } from '../services/interfaces';

const DriverDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    comments: '',
    rejectionReason: ''
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDriver();
    }
  }, [id]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id || '');
      setDriver(response.data.user);
    } catch (err) {
      setError('Failed to fetch driver details');
      console.error('Fetch driver error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDriver = async () => {
    if (!driver) return;

    try {
      const updateData = {
        deliveryPersonProfile: {
          ...driver.deliveryPersonProfile,
          documentVerificationStatus: reviewData.status === 'approved' ? 'approved' : 'rejected',
          backgroundCheckStatus: reviewData.status === 'approved' ? 'approved' : 'rejected'
        }
      };

      await updateUser(driver._id, updateData);
      setShowReviewModal(false);
      setReviewData({
        status: 'approved',
        comments: '',
        rejectionReason: ''
      });
      fetchDriver();
    } catch (err) {
      setError('Failed to update driver verification');
      console.error('Update driver verification error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleTypeIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bike': return '🚲';
      case 'motorcycle': return '🏍️';
      case 'car': return '🚗';
      case 'truck': return '🚚';
      case 'van': return '🚐';
      case 'walking': return '🚶';
      default: return '🚗';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Driver not found'}</p>
        <button
          onClick={() => navigate('/driver-verifications')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Driver Verifications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Driver Verification: {driver.firstName} {driver.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            {driver.email} • {driver.deliveryPersonProfile?.vehicleType || 'N/A'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/driver-verifications')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </button>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Review Driver
          </button>
        </div>
      </div>

      {/* Driver Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Verification</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.deliveryPersonProfile?.documentVerificationStatus || 'pending')}`}>
              {(driver.deliveryPersonProfile?.documentVerificationStatus || 'pending').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Background Check</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.deliveryPersonProfile?.backgroundCheckStatus || 'pending')}`}>
              {(driver.deliveryPersonProfile?.backgroundCheckStatus || 'pending').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {driver.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Driver Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Driver Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-sm text-gray-900">{driver.firstName} {driver.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900">{driver.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="text-sm text-gray-900">{driver.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {getVehicleTypeIcon(driver.deliveryPersonProfile?.vehicleType || 'car')}
              </span>
              <span className="text-sm text-gray-900 capitalize">
                {driver.deliveryPersonProfile?.vehicleType || 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <p className="text-sm text-gray-900">
              {driver.deliveryPersonProfile?.licenseNumber || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Expiry</label>
            <p className="text-sm text-gray-900">
              {driver.deliveryPersonProfile?.licenseExpiry 
                ? new Date(driver.deliveryPersonProfile.licenseExpiry).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Number</label>
            <p className="text-sm text-gray-900">
              {driver.deliveryPersonProfile?.insuranceNumber || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              driver.deliveryPersonProfile?.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {driver.deliveryPersonProfile?.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Working Areas */}
      {driver.deliveryPersonProfile?.workingAreas && driver.deliveryPersonProfile.workingAreas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Working Areas</h2>
          <div className="space-y-2">
            {driver.deliveryPersonProfile.workingAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{area.city}</span>
                  <span className="text-sm text-gray-500 ml-2">({area.radius} km radius)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <p className="text-2xl font-bold text-gray-900">
              {driver.deliveryPersonProfile?.rating || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Deliveries</label>
            <p className="text-2xl font-bold text-gray-900">
              {driver.deliveryPersonProfile?.totalDeliveries || 0}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
            <p className="text-2xl font-bold text-gray-900">
              ${driver.deliveryPersonProfile?.earnings?.total || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Document */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Driver's License</h3>
            {driver.deliveryPersonProfile?.licenseDocumentUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={`http://localhost:5000/${driver.deliveryPersonProfile.licenseDocumentUrl}`}
                    alt="Driver's License"
                    className="w-full h-64 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-full h-64 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Document Preview Not Available</p>
                      <a
                        href={`http://localhost:5000/${driver.deliveryPersonProfile.licenseDocumentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Click to view document
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`http://localhost:5000/${driver.deliveryPersonProfile.licenseDocumentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600"
                  >
                    View Full Document
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600 font-medium">No license document uploaded</p>
                <p className="text-sm text-gray-500 mt-1">Driver must upload their license document</p>
              </div>
            )}
          </div>

          {/* Insurance Document */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Document</h3>
            {driver.deliveryPersonProfile?.insuranceDocumentUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={`http://localhost:5000/${driver.deliveryPersonProfile.insuranceDocumentUrl}`}
                    alt="Insurance Document"
                    className="w-full h-64 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-full h-64 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Document Preview Not Available</p>
                      <a
                        href={`http://localhost:5000/${driver.deliveryPersonProfile.insuranceDocumentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Click to view document
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`http://localhost:5000/${driver.deliveryPersonProfile.insuranceDocumentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600"
                  >
                    View Full Document
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600 font-medium">No insurance document uploaded</p>
                <p className="text-sm text-gray-500 mt-1">Driver must upload their insurance document</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Driver Verification
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <textarea
                    value={reviewData.comments}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your review comments..."
                  />
                </div>
                {reviewData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <textarea
                      value={reviewData.rejectionReason}
                      onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rejection reason..."
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyDriver}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetail;
