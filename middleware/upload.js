// upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');

const uploadBase = path.join(__dirname, '..', 'uploads');

// Temporary local storage (for Cloudinary upload)
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.join(uploadBase, 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
});

// File type filter
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'), false);
};

// Middlewares
const uploadQuestionImage = upload.single('question_image');
const uploadOptionImage = upload.single('option_image');
const uploadProfileImage = upload.single('profile_image');

// Cloudinary upload helper middleware
const uploadToCloudinaryMiddleware = async (req, res, next) => {
  try {
    if (!req.file) return next();

    let folder = 'uploads';
    if (req.file.fieldname === 'question_image') folder = 'questions';
    if (req.file.fieldname === 'option_image') folder = 'options';
    if (req.file.fieldname === 'profile_image') folder = 'profiles';

    const cloudinaryResult = await uploadToCloudinary(req.file.path, folder);

    // Attach Cloudinary result to request object
    req.cloudinaryResult = cloudinaryResult;

    next();
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading to Cloudinary',
      error: error.message
    });
  }
};

// Error handler middleware
const handleImageUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'Image too large (max 10MB)'
        : 'Image upload error'
    });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = {
  uploadQuestionImage,
  uploadOptionImage,
  uploadProfileImage,
  uploadToCloudinaryMiddleware,
  handleImageUploadErrors
};
