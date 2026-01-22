import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers,
  updateUser
} from '../services/adminService';
import type { User } from '../services/interfaces';

const DriverVerifications: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [filters, setFilters] = useState({
    verificationStatus: 'all',
    vehicleType: 'all',
    search: ''
  });
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    comments: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, filters]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: currentPage,
        limit: 10,
        role: 'delivery_person',
        search: filters.search || undefined
      });
      
      setDrivers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setTotalDrivers(response.data.pagination.totalUsers || 0);
    } catch (err) {
      setError('Failed to fetch drivers');
      console.error('Fetch drivers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDriver = async () => {
    if (!selectedDriver) return;

    try {
      const updateData = {
        deliveryPersonProfile: {
          ...selectedDriver.deliveryPersonProfile,
          documentVerificationStatus: reviewData.status === 'approved' ? 'approved' : 'rejected',
          backgroundCheckStatus: reviewData.status === 'approved' ? 'approved' : 'rejected'
        }
      };

      await updateUser(selectedDriver._id, updateData);
      setShowReviewModal(false);
      setReviewData({
        status: 'approved',
        comments: '',
        rejectionReason: ''
      });
      fetchDrivers();
    } catch (err) {
      setError('Failed to update driver verification');
      console.error('Update driver verification error:', err);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getVerificationStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Driver Verification Management</h1>
        <div className="text-sm text-gray-500">
          {totalDrivers} total drivers
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{totalDrivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.deliveryPersonProfile?.documentVerificationStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.deliveryPersonProfile?.documentVerificationStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.deliveryPersonProfile?.documentVerificationStatus === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={filters.vehicleType}
              onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              <option value="bike">Bike</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="walking">Walking</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search drivers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchDrivers}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Background Check
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {getVehicleTypeIcon(driver.deliveryPersonProfile?.vehicleType || 'car')}
                      </span>
                      <span className="text-sm text-gray-900 capitalize">
                        {driver.deliveryPersonProfile?.vehicleType || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {driver.deliveryPersonProfile?.licenseNumber || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {driver.deliveryPersonProfile?.licenseExpiry 
                        ? `Expires: ${new Date(driver.deliveryPersonProfile.licenseExpiry).toLocaleDateString()}`
                        : 'No expiry date'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(driver.deliveryPersonProfile?.documentVerificationStatus || 'pending')}`}>
                      {(driver.deliveryPersonProfile?.documentVerificationStatus || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(driver.deliveryPersonProfile?.backgroundCheckStatus || 'pending')}`}>
                      {(driver.deliveryPersonProfile?.backgroundCheckStatus || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/driver-verifications/${driver._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowReviewModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Quick Review
                      </button>
                      {driver.deliveryPersonProfile?.licenseDocumentUrl && (
                        <a
                          href={`http://localhost:5000/${driver.deliveryPersonProfile.licenseDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                        >
                          View License
                        </a>
                      )}
                      {driver.deliveryPersonProfile?.insuranceDocumentUrl && (
                        <a
                          href={`http://localhost:5000/${driver.deliveryPersonProfile.insuranceDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-900"
                        >
                          View Insurance
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalDrivers)} of {totalDrivers} drivers
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Driver: {selectedDriver.firstName} {selectedDriver.lastName}
              </h3>
              
              {/* Driver Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedDriver.deliveryPersonProfile?.vehicleType || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="text-sm text-gray-900">
                    {selectedDriver.deliveryPersonProfile?.licenseNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Expiry</label>
                  <p className="text-sm text-gray-900">
                    {selectedDriver.deliveryPersonProfile?.licenseExpiry 
                      ? new Date(selectedDriver.deliveryPersonProfile.licenseExpiry).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance Number</label>
                  <p className="text-sm text-gray-900">
                    {selectedDriver.deliveryPersonProfile?.insuranceNumber || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Document Preview Section */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* License Document */}
                  {selectedDriver.deliveryPersonProfile?.licenseDocumentUrl ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Driver's License</h5>
                      <div className="space-y-2">
                        <img
                          src={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.licenseDocumentUrl}`}
                          alt="Driver's License"
                          className="w-full h-48 object-contain border border-gray-200 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-full h-48 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Document Preview Not Available</p>
                            <a
                              href={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.licenseDocumentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Click to view document
                            </a>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.licenseDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Full Document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Driver's License</h5>
                      <p className="text-sm text-red-600">No license document uploaded</p>
                    </div>
                  )}

                  {/* Insurance Document */}
                  {selectedDriver.deliveryPersonProfile?.insuranceDocumentUrl ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Insurance Document</h5>
                      <div className="space-y-2">
                        <img
                          src={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.insuranceDocumentUrl}`}
                          alt="Insurance Document"
                          className="w-full h-48 object-contain border border-gray-200 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-full h-48 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Document Preview Not Available</p>
                            <a
                              href={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.insuranceDocumentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Click to view document
                            </a>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:5000/${selectedDriver.deliveryPersonProfile.insuranceDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Full Document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Insurance Document</h5>
                      <p className="text-sm text-red-600">No insurance document uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Form */}
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

export default DriverVerifications;
