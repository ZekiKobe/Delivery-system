import express from 'express';
import { 
  uploadProfileImage,
  uploadLicenseDocuments,
  uploadBusinessDocuments,
  uploadBusinessImages,
  deleteBusinessGalleryImage,
  getUploadProgress,
  uploadMenuItemImages
} from '../controllers/uploadController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { 
  uploadConfigs, 
  handleUploadError, 
  createMultipleUploadMiddleware 
} from '../services/uploadService.js';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// Upload profile image - Not implemented yet
// router.post('/profile-image', 
//   uploadConfigs.profileImage.single('profileImage'),
//   handleUploadError,
//   uploadProfileImage
// );

// Upload delivery person license documents
router.post('/license-documents',
  uploadConfigs.licenseDocument.fields([
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 }
  ]),
  handleUploadError,
  uploadLicenseDocuments
);

// Upload business documents - Not implemented yet
// router.post('/business-documents',
//   uploadConfigs.businessDocuments.fields([
//     { name: 'businessLicense', maxCount: 1 },
//     { name: 'taxDocument', maxCount: 1 }
//   ]),
//   handleUploadError,
//   uploadBusinessDocuments
// );

// Upload business images (logo, cover, gallery) - Not implemented yet
// router.post('/business-images/:businessId',
//   uploadConfigs.businessImages.fields([
//     { name: 'businessLogo', maxCount: 1 },
//     { name: 'businessCover', maxCount: 1 },
//     { name: 'businessGallery', maxCount: 5 }
//   ]),
//   handleUploadError,
//   uploadBusinessImages
// );

// Upload menu item images - Not implemented yet
// router.post('/menu-images',
//   uploadConfigs.menuImages.fields([
//     { name: 'menuImages', maxCount: 5 }
//   ]),
//   handleUploadError,
//   uploadMenuItemImages
// );

// Delete business gallery image - Not implemented yet
// router.delete('/business-images/:businessId/gallery/:imageUrl',
//   deleteBusinessGalleryImage
// );

// Get upload progress - Not implemented yet
// router.get('/progress/:uploadId',
//   getUploadProgress
// );

// Admin only routes
router.use('/admin', adminOnly);

// Admin can upload files for any user (useful for manual verification)
router.post('/admin/user/:userId/documents',
  uploadConfigs.businessDocuments.fields([
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 }
  ]),
  handleUploadError,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Admin upload logic here
      res.json({
        success: true,
        message: 'Files uploaded successfully by admin',
        data: {
          files: req.files,
          userId
        }
      });

    } catch (error) {
      console.error('Admin upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files'
      });
    }
  }
);

export default router;