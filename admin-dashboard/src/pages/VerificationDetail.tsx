import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getVerificationApplicationById,
  reviewVerificationApplication,
  updateDocumentStatus
} from '../services/adminService';
import type { VerificationApplication } from '../services/interfaces';

const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<VerificationApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    comments: '',
    changesRequested: [] as string[],
    documentReviews: [] as any[]
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await getVerificationApplicationById(id || '');
      setApplication(response.data);
    } catch (err) {
      setError('Failed to fetch application details');
      console.error('Fetch application error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentReview = async (documentId: string, status: 'approved' | 'rejected', reason?: string) => {
    if (!application) return;

    try {
      await updateDocumentStatus(application._id, documentId, status, reason);
      // Refresh the application data
      await fetchApplication();
    } catch (err) {
      setError('Failed to update document status');
      console.error('Update document status error:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!application) return;

    try {
      await reviewVerificationApplication(application._id, reviewData);
      navigate('/verifications');
    } catch (err) {
      setError('Failed to submit review');
      console.error('Submit review error:', err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Application not found'}</p>
        <button
          onClick={() => navigate('/verifications')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Verifications
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
            Verification Review: {application.applicationNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {application.business.name} - {application.business.businessType}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/verifications')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </button>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Submit Review
          </button>
        </div>
      </div>

      {/* Application Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Overall Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.overallStatus)}`}>
              {application.overallStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <span className="text-sm text-gray-900">{application.priority.toUpperCase()}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Submitted</label>
            <span className="text-sm text-gray-900">
              {new Date(application.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <p className="text-sm text-gray-900">{application.business.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Type</label>
            <p className="text-sm text-gray-900">{application.business.businessType}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <p className="text-sm text-gray-900">{application.businessInfo.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID</label>
            <p className="text-sm text-gray-900">{application.businessInfo.taxId || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Established Year</label>
            <p className="text-sm text-gray-900">{application.businessInfo.establishedYear || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Count</label>
            <p className="text-sm text-gray-900">{application.businessInfo.employeeCount || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-sm text-gray-900">
              {application.owner.firstName} {application.owner.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900">{application.owner.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Identity Verified</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              application.ownerVerification.identityVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {application.ownerVerification.identityVerified ? 'VERIFIED' : 'NOT VERIFIED'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Verified</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              application.ownerVerification.addressVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {application.ownerVerification.addressVerified ? 'VERIFIED' : 'NOT VERIFIED'}
            </span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
        <div className="space-y-4">
          {application.documents.map((document) => (
            <div key={document._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                  <p className="text-sm text-gray-500">
                    {document.originalName} • {(document.size / 1024).toFixed(1)} KB
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                      {document.status.toUpperCase()}
                    </span>
                    {document.isRequired && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        REQUIRED
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    View Document
                  </a>
                  <button
                    onClick={() => handleDocumentReview(document._id, 'approved')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        handleDocumentReview(document._id, 'rejected', reason);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Submit Review
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="additional_info_required">Request Additional Info</option>
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
                    <label className="block text-sm font-medium text-gray-700">Changes Requested</label>
                    <textarea
                      value={reviewData.changesRequested.join('\n')}
                      onChange={(e) => setReviewData(prev => ({ 
                        ...prev, 
                        changesRequested: e.target.value.split('\n').filter(item => item.trim()) 
                      }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter changes requested (one per line)..."
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
                  onClick={handleSubmitReview}
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

export default VerificationDetail;
