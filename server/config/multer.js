const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

const limits = { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 };

const uploadProduct = multer({ storage: createStorage('products'), fileFilter, limits });
const uploadCategory = multer({ storage: createStorage('categories'), fileFilter, limits });
const uploadAvatar = multer({ storage: createStorage('avatars'), fileFilter, limits });

module.exports = { uploadProduct, uploadCategory, uploadAvatar };
