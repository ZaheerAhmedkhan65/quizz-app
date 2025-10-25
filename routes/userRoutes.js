const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
    uploadProfileImage,
    uploadToCloudinaryMiddleware,
    handleImageUploadErrors
  } = require('../middleware/upload');

router.get('/dashboard', userController.userDashboard);
router.get('/profile', userController.userProfile);
router.post(
    '/profile/update',
    uploadProfileImage,
    handleImageUploadErrors,
    uploadToCloudinaryMiddleware,
    userController.userProfileUpdate
  );
  
module.exports = router;