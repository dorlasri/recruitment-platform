const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const memUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'recruitment/cvs',
        resource_type: 'raw',
        format: 'pdf',
        public_id: `cv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });

const upload = {
  single: (field) => (req, res, next) => {
    memUpload.single(field)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
        next();
      } catch (e) {
        next(e);
      }
    });
  },
};

module.exports = { upload, cloudinary };
