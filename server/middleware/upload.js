const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'staybook',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
  }),
});

module.exports = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
